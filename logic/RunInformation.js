var Job = require('./model/JobModel');

var RunInformation = function() {
    this.isJobRunning = false;
    // ToDo: Load behaviour from config file -> Better to use an int/constant whatever?
    this.behaviour = "blocking";
    this.jobQueue = [];
    this.runningJob = {};
};

/* ----- Getter ----- */

RunInformation.prototype.isJobRunning = function () {
    return this.isJobRunning;
};

RunInformation.prototype.getRunningJob = function () {
    return this.runningJob;
};

/* ----- Setter/Adder ----- */

RunInformation.prototype.addJob = function (jobName, jobFunction, callback) {
    if(this.behaviour == "blocking" && this.jobQueue.length > 1) {
        callback();
    } else {
        this.jobQueue.push(new Job(jobName, jobFunction, callback));
    }
};

RunInformation.prototype.__executeJob = function() {
    this.isJobRunning = true;

    if(this.jobQueue.length >= 1) {
        this.runningJob = this.jobQueue.shift();

        var job = this.runningJob.getJobFunction();

        // ToDo: Parameter Handling and callback value handling
        job(function () {
            var callback = this.runningJob.getCallback();
            
            callback();
        });
    } else {
        // ToDo: Some Error Handling
    }
};

module.exports = new RunInformation();