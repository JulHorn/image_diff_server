var JobModel = require('./JobModel');

var CheckAllJob = function (jobFunction, autoCrop, pixDiffThreshold, distThreshold, callback) {
    this.prototype = new JobModel('Check All', jobFunction, callback);
    this.autoCrop = autoCrop;
    this.pixDiffThreshold = pixDiffThreshold;
    this.distThreshold = distThreshold;
};

/* ----- Action ----- */

CheckAllJob.prototype.execute = function (callback) {
    this.getJobFunction(this.autoCrop, this.pixDiffThreshold, this.distThreshold, this.getCallbackFunction);

    // Call when the execution has finished
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