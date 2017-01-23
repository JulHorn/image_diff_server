var JobModel = require('./Job');

var CheckOneJob = function (id, callback) {
    this.prototype = new JobModel('Check One', callback);
    this.id = id;
};

/* ----- Action ----- */

CheckOneJob.prototype.execute = function (callback) {
    this.prototype.getImageManipulator().makeToNewReferenceImage(this.id, this.prototype.getCallbackFunction());

    // Notify the job handler that this job is finished
    callback();
};

module.exports = CheckOneJob;