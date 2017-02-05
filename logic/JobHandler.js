var Job = require('./job/Job');
var CheckAllJob = require('./job/CheckAllJob');
var DeleteJob = require('./job/DeleteJob');
var MakeNewToReferenceImageJob = require('./job/MakeNewToReferenceImageJob');
var ImageMetaInformationModel = require('./model/ImageMetaInformationModel');
var logger = require('winston');
var configuration = require('./ConfigurationLoader');
var fs = require('fs-extra');

/**
 * Constructor.
 * The JobHandler executes jobs which were added via the addJob to a queue. The jobs in that queue will be executed automatically.
 * There exist two execution modes.
 * 'Discard': One job will be allowed in the queue and all further jobs will be discarded.
 * 'Queue': The jobs will be executed in FIFO order.
 * The JobHandler allows access to the running job to retrieve some information about the current run status.
 * **/
var JobHandler = function() {
    this.isJobRunning = false;
    this.behaviour = configuration.getWorkingMode();
    this.jobQueue = [];
    this.jobHistory = [];
    this.runningJob = null;
    this.currentMetaInformationModel = new ImageMetaInformationModel();

    this.__load();
};

/* ----- Getter ----- */

JobHandler.prototype.isJobRunning = function () {
    return this.isJobRunning;
};

JobHandler.prototype.getLastActiveJob = function () {
    if(this.runningJob) {
        return this.runningJob;
    } else if(this.jobHistory.length > 0) {
        return this.jobHistory[this.jobHistory.length - 1];
    }

    logger.error('No job available to return. Something seems to be amiss in the Job Handler.');
    throw Error('No job available to return. Something seems to be amiss in the Job Handler.');
};

/* ----- Setter/Adder ----- */

/**
 * Adds a job to the queue.
 *
 * @param job The job which will be added/discarded to the queue, depending on the execution mode.
 * **/
JobHandler.prototype.addJob = function (job) {
    try {
        // If the max. number of elements in the history is higher than specified, remove the oldest one
        if(configuration.getMaxNumberIfStoredJobs() <= this.jobHistory.length) {
            this.jobHistory.shift();
        }

        // Discard job if something is already in the queue
        if (this.behaviour == 0
            && (this.jobQueue.length > 1
            || this.isJobRunning)) {
            logger.info('There is already a job being executed. Execution behaviour is set to discard. Discarding new job.');
            // Add job to queue
        } else {
            logger.info('Adding new job to the queue:', job.getJobName());
            this.jobQueue.push(job);
            this.__executeJob();
        }
    } catch (exception){
        logger.error(exception);
    }
};

/* ----- Privates ----- */

/**
 * Execute a job. After a job execution is finished, the next job will be executed automatically.
 * **/
JobHandler.prototype.__executeJob = function() {
    var that = this;

    try {
        // If there exists a job, then change the state to isRunning and execute the job
        if (this.jobQueue.length >= 1 && !this.isJobRunning) {
            this.isJobRunning = true;
            this.runningJob = this.jobQueue.shift();

            // ToDo: Error handling: If something happens, the job locks the execution queue forever
            logger.info('Executing job:', this.runningJob.getJobName());
            this.runningJob.execute(that.currentMetaInformationModel, function () {
                // When finished: Put the job on the history stack
                that.isJobRunning = false;
                that.jobHistory.push(that.runningJob);
                that.runningJob = null;

                // Save history
                that.__save();

                // Execute the next job
                that.__executeJob();
            });
        } else {
            // ToDo: Some Error Handling or do nothing because there is nothing to do?
        }
    } catch (exception) {
        logger.error(exception);
    }
};

/**
 * Saves job history to file.
 * **/
JobHandler.prototype.__save = function () {

    // Ensure that the folder structure for the data files exists
    logger.info('Ensuring that the job history path exists:', configuration.getJobHistoryFolderPath());
    fs.ensureDirSync(configuration.getJobHistoryFolderPath());

    // Write the file
    fs.writeFile(configuration.getJobHistoryFilePath(), JSON.stringify(this.jobHistory), 'utf8', function (err) {
        if(err != null || typeof err == 'undefined'){
            logger.error('Failed to write job history.', err);
        } else {
            logger.info('Writing job history finished.', configuration.getJobHistoryFilePath());
        }
    });
};

/**
 * Loads the job history. If it does not exist or is faulty, the job history will begin from a blank slate.
 * **/
JobHandler.prototype.__load = function () {
    var that = this;
    var jobFilePath = configuration.getJobHistoryFilePath();

    logger.info('Loading job history:', jobFilePath);

    // Check that file exists -> If not, then do nothing because the diff has to be calculated first
    try{
        fs.accessSync(jobFilePath);
    } catch(err) {
        logger.info('Job history file does not seem to exist. Working from a blank slate.', jobFilePath);
        // Add an empty job which can always be returned
        this.jobHistory.push(new Job('EmptyJob', new ImageMetaInformationModel(), null));
        return;
    }

    // Load data in object structure, delete file if it is corrupt
    try {
        // Blocking file read to ensure that the complete data is loaded before further actions are taken
        var jobHistory = fs.readFileSync(jobFilePath, 'utf8');

        jobHistory = JSON.parse(jobHistory);

        jobHistory.forEach(function (job) {
            that.jobHistory.push(that.__loadJob(job));
        });

    } catch (exception) {
        logger.error('Failed to load or parse job history file. Working from a blank slate.', exception);
        // Add an empty job which can always be returned
        this.jobHistory.push(new Job('EmptyJob', new ImageMetaInformationModel(), null));
    }

    // Use the last jobs imagemetainformation model as current model
    this.currentMetaInformationModel = this.getLastActiveJob().getImageMetaInformationModel().getCopy();
};

JobHandler.prototype.__loadJob = function (jobData) {
    var job = {};

    switch(jobData.jobName) {
        case 'MakeToNewBaselineImage':
            job = new MakeNewToReferenceImageJob(null, null, null);
            break;
        case 'DeleteSet':
            job = new DeleteJob(null, null, null);
            break;
        case 'CheckAll':
            job = new CheckAllJob(null, null, null, null, null);
            break;
        case 'EmptyJob':
            return new Job('EmptyJob', null, null);
        default:
            throw Error('The job type ' + jobData.jobName + ' is unknown or not yet mapped.');
    }

    job.load(jobData);

    return job;
};

module.exports = new JobHandler();