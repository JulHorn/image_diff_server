var JobModel = require('./JobModel');

var DeleteJob = function (id, callback) {
    this.prototype = new JobModel('Delete Set', callback);
    this.id = id;
};

/* ----- Action ----- */

DeleteJob.prototype.execute = function (callback) {
    this.prototype.getImageManipulator().deleteImageSet(this.id, this.prototype.getCallbackFunction());

    // Notify the job handler that this job is finished
    callback();
};

module.exports = DeleteJob;