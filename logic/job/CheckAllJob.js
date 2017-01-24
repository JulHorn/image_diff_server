var Job = require('./Job');

/**
 * Job which computes diff images for all images with the same name in the reference/new folder (configured in the config file). The diff images will
 * written in the diff image folder. Updated the meta structure.
 *
 * @param autoCrop Determines if the new/reference images should be autocroped before comparison to yield better results if the sometimes differ in size. Must be a boolean.
 * @param pixDiffThreshold The pixel threshold.
 * @param distThreshold The distance threshold.
 * @param callback The callback method which is called, when diff process as finished. Has the ImageMetaInformationModel as job. Optional.
 * **/
var CheckAllJob = function (autoCrop, pixDiffThreshold, distThreshold, callback) {
    this.prototype = new Job('Check All', callback);
    this.autoCrop = autoCrop;
    this.pixDiffThreshold = pixDiffThreshold;
    this.distThreshold = distThreshold;
};

CheckAllJob.prototype = Object.create(Job.prototype);

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param callback The callback which will be called after the job execution is finished.
 * **/
CheckAllJob.prototype.execute = function (callback) {
    var that = this;

    this.prototype.getImageManipulator().createDiffImages(this.autoCrop, this.pixDiffThreshold, this.distThreshold, function(imageMetaModel) {
        that.prototype.getCallbackFunction()(imageMetaModel);

        // Notify the job handler that this job is finished
        callback();
    });
};

/* ----- Getter ----- */

/**
 * Returns true if the auto crop function is enabled, else false.
 *
 * @return Returns true if the auto crop function is enabled, else false.
 * **/
CheckAllJob.prototype.isAutoCropEnabled = function () {
    return this.autoCrop;
};

/**
 * Returns the maximum allowed pixel threshold. The return value is between 0 and 1.
 *
 * @return Returns the maximum allowed pixel threshold. The return value is between 0 and 1.
 * **/
CheckAllJob.prototype.getMaxPixelDifferenceThreshold = function () {
  return this.pixDiffThreshold;
};

/**
 * Returns the maximum allowed distance threshold. The return value is between 0 and 1.
 *
 * @return Returns the maximum allowed distance threshold. The return value is between 0 and 1.
 * **/
CheckAllJob.prototype.getMaxDistanceDifferenceThreshold = function () {
    return this.distThreshold;
};

module.exports = CheckAllJob;