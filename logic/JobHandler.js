var logger = require('winston');

var JobHandler = function() {
    this.isJobRunning = false;
    // ToDo: Load behaviour from config file -> Better to use an int/constant whatever?
    this.behaviour = 'discard';
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

/* ----- Setter/Adder ----- */

JobHandler.prototype.addJob = function (job) {
    if(this.behaviour == 'discard'
        && (this.jobQueue.length > 1 || this.isJobRunning)) {
        logger.info('There is already a job being executed. Execution behaviour is set to discard. Discarding new job.');
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