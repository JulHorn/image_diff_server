var Job = require('./job/Job');
var CheckAllJob = require('./job/CheckAllJob');
var DeleteJob = require('./job/DeleteJob');
var MakeNewToReferenceImageJob = require('./job/MakeNewToReferenceImageJob');
var ImageMetaInformationModel = require('./model/ImageMetaInformationModel');
var ModifyIgnoreAreasJob = require('./job/ModifyIgnoreAreasJob');
var CompareImageByNameJob = require('./job/CompareImageByNameJob');
var logger = require('winston');
var config = require('./ConfigurationLoader');
var fs = require('fs-extra');

/**
 * Constructor.
 * The JobHandler executes jobs which were added via the addJob to a queue. The jobs in that queue will be executed automatically.
 * There exist two execution modes.
 * 'Discard': One job will be allowed in the queue and all further jobs will be discarded.
 * 'Queue': The jobs will be executed in FIFO order.
 * The JobHandler allows access to the running job to retrieve some information about the current run status.
 *
 * @constructor
 * **/
var JobHandler = function() {
    this.isJobRunning = false;
    this.behaviour = config.getWorkingMode();
    this.jobQueue = [];
    this.jobHistory = [];
    this.runningJob = null;
    this.currentMetaInformationModel = new ImageMetaInformationModel();

    // Loads the job history
    this.__loadJobHistory();
};

/* ----- Getter ----- */

/**
 * Returns true if a job is currently active, else false.
 *
 * @return {Boolean} Returns true if a job is currently active, else false.
 * **/
JobHandler.prototype.isJobRunning = function () {
    return this.isJobRunning;
};

/**
 * Returns the currently active job or if no job was active, the last executed job.
 *
 * @return {Job} Returns the currently active job or if no job was active, the last executed job.
 * **/
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
 * @param {Job} job The job which will be added/discarded to the queue, depending on the execution mode.
 * **/
JobHandler.prototype.addJob = function (job) {
    try {
        // If the max. number of elements in the history is higher than specified, remove the oldest one
        if(config.getMaxNumberIfStoredJobs() <= this.jobHistory.length) {
            this.jobHistory.shift();
        }

        // Discard job if something is already in the queue
        if (this.behaviour === 0
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
 * Loads the job history. If it does not exist or is faulty, the job history will begin from a blank slate.
 * **/
JobHandler.prototype.__loadJobHistory = function () {
    var that = this;
    var jobFilePath = config.getJobHistoryFilePath();

    logger.info('Loading job history:', jobFilePath);

    // Load data in object structure, delete file if it is corrupt
    try {
        // Blocking file read to ensure that the complete data is loaded before further actions are taken
        var jobHistory = fs.readFileSync(jobFilePath, 'utf8');

        jobHistory = JSON.parse(jobHistory);

        jobHistory.forEach(function (job) {
            that.jobHistory.push(that.__loadJob(job));
        });

    } catch (exception) {
        logger.error('Failed to load or parse job history file ' + jobFilePath + '. Working from a blank slate.', exception);
        // Add an empty job which can always be returned
        this.jobHistory.push(new Job('EmptyJob', new ImageMetaInformationModel()));
    }

    // Use the last jobs image meta model as current model because it should be the last recent
    this.currentMetaInformationModel = this.getLastActiveJob().getImageMetaInformationModel().getCopy();
};

/**
 * Saves job history to file.
 * **/
JobHandler.prototype.__save = function () {

    // Ensure that the folder structure for the data files exists
    logger.info('Ensuring that the job history path exists:', config.getDataFolderPath());
    fs.ensureDirSync(config.getDataFolderPath());

    // Write the file
    fs.writeFile(config.getJobHistoryFilePath(), JSON.stringify(this.jobHistory), 'utf8', function (err) {
        if(err !== null || typeof err === 'undefined'){
            logger.error('Failed to write job history.', err);
        } else {
            logger.info('Writing job history finished.', config.getJobHistoryFilePath());
        }
    });
};

/**
 * Checks which type of the given object has, creates a corresponding job which is identified by the job name,
 * loads the data in that job and returns the newly created job.
 *
 * @param {Object} jobData The object which contains the data of the job.
 * **/
JobHandler.prototype.__loadJob = function (jobData) {
    var job = {};

    // Create the correct job type
    switch(jobData.jobName) {
        case 'MakeToNewBaselineImage':
            job = new MakeNewToReferenceImageJob();
            break;
        case 'DeleteSet':
            job = new DeleteJob();
            break;
        case 'CheckAll':
            job = new CheckAllJob();
            break;
        case 'ModifyIgnoreAreasJob':
            job = new ModifyIgnoreAreasJob();
            break;
        case 'CompareImageByNameJob':
            job = new CompareImageByNameJob();
            break;
        case 'EmptyJob':
            return new Job('EmptyJob');
        default:
            throw Error('The job type ' + jobData.jobName + ' is unknown or not yet mapped.');
    }

    // Load the data in the created job
    job.load(jobData);

    return job;
};

module.exports = new JobHandler();