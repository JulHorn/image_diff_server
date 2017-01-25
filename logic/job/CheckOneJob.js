var JobModel = require('./Job');

/**
 * Job which computes the diff image of two images. Updates the meta structure.
 *
 * @param id The id of the image set containing the information about the images which should be compared.
 * @param callback The callback method which is called, when diff process as finished. Has the ImageMetaInformationModel as parameter. Optional.
 * **/
var CheckOneJob = function (id, callback) {
    this.prototype = new JobModel('Check One', callback);
    this.id = id;
};

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param callback The callback which will be called after the job execution is finished.
 * **/
CheckOneJob.prototype.execute = function (callback) {
    var that = this;

    this.prototype.getImageManipulator().makeToNewReferenceImage(this.id, function(imageMetaModel) {
        that.prototype.getCallbackFunction()(imageMetaModel);

        // Notify the job handler that this job is finished
        callback();
    });
};

module.exports = CheckOneJob;