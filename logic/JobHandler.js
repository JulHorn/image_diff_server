var logger = require('winston');
var configuration = require('./ConfigurationLoader');

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

/**
 * Adds a job to the queue.
 *
 * @param job The job which will be added/discarded to the queue, depending on the execution mode.
 * **/
JobHandler.prototype.addJob = function (job) {
    try {
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
            this.runningJob.execute(function () {
                that.isJobRunning = false;
                that.runningJob = null;

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

module.exports = new JobHandler();