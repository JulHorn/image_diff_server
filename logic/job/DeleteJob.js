var JobModel = require('./Job');

/**
 * Job which deletes an image set. Updates the meta structure.
 *
 * @param id The id of the image set which should be deleted.
 * @param callback The callback method which is called, when diff process as finished. Has the ImageMetaInformationModel as parameter. Optional.
 * **/
var DeleteJob = function (id, callback) {
    this.prototype = new JobModel('Delete Set', callback);
    this.id = id;
};

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param callback The callback which will be called after the job execution is finished.
 * **/
DeleteJob.prototype.execute = function (callback) {
    var that = this;

    this.prototype.getImageManipulator().deleteImageSet(this.id, function(imageMetaModel) {
        that.prototype.getCallbackFunction()(imageMetaModel);

        // Notify the job handler that this job is finished
        callback();
    });
};

module.exports = DeleteJob;