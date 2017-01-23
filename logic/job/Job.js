var ImageManipulator = require('./../ImageManipulator');

var Job = function(jobName, callback) {
    this.jobName = jobName;
    this.callback = callback;
    this.processedImageCount = 0;
    // Expect that only one image has to be processed as default and change the number in the method in which more than
    // one image should be processed (e.g. check all images etc.)
    this.imagesToBeProcessedCount = 1;
    this.imageManipulator = new ImageManipulator();
};

/* ----- Getter ----- */

Job.prototype.getJobName = function () {
    return this.jobName;
};

Job.prototype.getImagesToBeProcessedCount = function () {
    return this.imagesToBeProcessedCount;
};

Job.prototype.getProcessedImageCount = function () {
    return this.processedImageCount;
};

Job.prototype.getCallbackFunction = function () {
    return this.callback;
};

Job.prototype.getImageManipulator = function () {
  return this.imageManipulator;
};

/* ----- Setter/Adder ----- */

Job.prototype.setImagesToBeProcessedCount = function(imagesToBeProcessedCount) {
    this.imagesToBeProcessedCount = imagesToBeProcessedCount;
};

Job.prototype.setProcessedImageCount = function(processedImageCount) {
    this.processedImageCount = processedImageCount;
};

Job.prototype.incrementProcessImageCounter = function() {
    this.processedImageCount = this.processedImageCount + 1;
};

module.exports = Job;