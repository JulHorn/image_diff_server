var JobModel = require('./Job');

var CheckOneJob = function (id, callback) {
    this.prototype = new JobModel('Check One', callback);
    this.id = id;
};

/* ----- Action ----- */

CheckOneJob.prototype.execute = function (callback) {
    var that = this;

    this.prototype.getImageManipulator().makeToNewReferenceImage(this.id, function(imageMetaModel) {
        that.prototype.getCallbackFunction()(imageMetaModel);

        // Notify the job handler that this job is finished
        callback();
    });
};

module.exports = CheckOneJob;