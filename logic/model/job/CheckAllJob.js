var JobModel = require('./JobModel');

var CheckAllJob = function (autoCrop, pixDiffThreshold, distThreshold, callback) {
    this.prototype = new JobModel('Check All', callback);
    this.autoCrop = autoCrop;
    this.pixDiffThreshold = pixDiffThreshold;
    this.distThreshold = distThreshold;
};

/* ----- Action ----- */

CheckAllJob.prototype.execute = function (callback) {
    this.prototype.getImageManipulator().createDiffImages(this.autoCrop, this.pixDiffThreshold, this.distThreshold, this.prototype.getCallbackFunction());

    // Notify the job handler that this job is finished
    callback();
};

/* ----- Getter ----- */

CheckAllJob.prototype.isAutoCropEnabled = function () {
    return this.autoCrop;
};

CheckAllJob.prototype.getMaxPixelDifferenceThreshold = function () {
  return this.pixDiffThreshold;
};

CheckAllJob.prototype.getMaxDistanceDifferenceThreshold = function () {
    return this.distThreshold;
};

module.exports = CheckAllJob;