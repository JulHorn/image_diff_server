var logger = require('winston');
var configuration = require('../logic/ConfigurationLoader');

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
    // ToDo: Load behaviour from config file -> Better to use an int/constant whatever?
    this.behaviour = configuration.getWorkingMode();
    this.jobQueue = [];
    this.runningJob = null;
};

/* ----- Getter ----- */

JobHandler.prototype.isJobRunning = function () {
    return this.isJobRunning;
};

JobHandler.prototype.getRunningJob = function () {
    return this.runningJob;
};

JobHandler.prototype.getRunningJobProgressedImages = function () {
    if(this.runningJob) {

        return this.runningJob.prototype.getProcessedImageCount();
    }
    return 0;
};

JobHandler.prototype.getRunningJobImagesToProgressTotal = function () {
    if(this.runningJob) {
        return this.runningJob.prototype.getImagesToBeProcessedCount();
    }
    return 0;
};

/* ----- Setter/Adder ----- */

/**
 * Adds a job to the queue.
 *
 * @param job The job which will be added/discarded to the queue, depending on the execution mode.
 * **/
JobHandler.prototype.addJob = function (job) {
    // Discard job if something is already in the queue
    if(this.behaviour == 0
        && (this.jobQueue.length > 1
        || this.isJobRunning)) {
        logger.info('There is already a job being executed. Execution behaviour is set to discard. Discarding new job.');
    // Add job to queue
    } else {
        logger.info('Adding new job to the queue:', job.prototype.getJobName());
        this.jobQueue.push(job);
        this.__executeJob();
    }
};

JobHandler.prototype.setImagesToBeProcessedCount = function(imagesToBeProcessedCount) {
    if(this.isJobRunning && this.runningJob) {
        this.runningJob.prototype.setImagesToBeProcessedCount(imagesToBeProcessedCount);
    }
};

JobHandler.prototype.setProcessedImageCount = function(processedImageCount) {
    if(this.isJobRunning && this.runningJob) {
        this.runningJob.prototype.setProcessedImageCount(processedImageCount);
    }
};

JobHandler.prototype.incrementProcessImageCounter = function() {
    if(this.isJobRunning && this.runningJob) {
        this.runningJob.prototype.incrementProcessImageCounter();
    }
};

/* ----- Privates ----- */

/**
 * Execute a job. After a job execution is finished, the next job will be executed automatically.
 * **/
JobHandler.prototype.__executeJob = function() {
    var that = this;

    // If there exists a job, then change the state to isRunning and execute the job
    if(this.jobQueue.length >= 1 && !this.isJobRunning) {
        this.isJobRunning = true;
        this.runningJob = this.jobQueue.shift();

        // ToDo: Error handling: If something happens, the job locks the execution queue forever
        logger.info('Executing job:', this.runningJob.prototype.getJobName());
        this.runningJob.execute(function () {
            that.isJobRunning = false;
            that.runningJob = null;

            // Execute the next job
            that.__executeJob();
        });
    } else {
        // ToDo: Some Error Handling or do nothing because there is nothing to do?
    }
};

module.exports = new JobHandler();