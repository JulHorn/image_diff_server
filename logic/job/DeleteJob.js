var JobModel = require('./Job');

var DeleteJob = function (id, callback) {
    this.prototype = new JobModel('Delete Set', callback);
    this.id = id;
};

/* ----- Action ----- */

DeleteJob.prototype.execute = function (callback) {
    var that = this;

    this.prototype.getImageManipulator().deleteImageSet(this.id, function(imageMetaModel) {
        that.prototype.getCallbackFunction()(imageMetaModel);

        // Notify the job handler that this job is finished
        callback();
    });
};

module.exports = DeleteJob;