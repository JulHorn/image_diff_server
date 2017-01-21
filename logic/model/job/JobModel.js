var JobModel = function(jobName, jobFunction, callback) {
    this.jobName = jobName;
    this.jobFunction = jobFunction;
    this.callback = callback;
    this.processedImageCount = 0;
    // Expect that only one image has to be processed as default and change the number in the method in which more than
    // one image should be processed (e.g. check all images etc.)
    this.imagesToBeProcessedCount = 1;
};

/* ----- Getter ----- */

JobModel.prototype.getJobName = function () {
    return this.jobName;
};

JobModel.prototype.getImagesToBeProcessedCount = function () {
    return this.imagesToBeProcessedCount;
};

JobModel.prototype.getProcessedImageCount = function () {
    return this.processedImageCount;
};

JobModel.prototype.getJobFunction = function () {
    return this.jobFunction;
};

JobModel.prototype.getCallbackFunction = function () {
    return this.callback;
};

/* ----- Setter/Adder ----- */

JobModel.prototype.setImagesToBeProcessedCount = function(imagesToBeProcessedCount) {
    this.imagesToBeProcessedCount = imagesToBeProcessedCount;
};

JobModel.prototype.setProcessedImageCount = function(processedImageCount) {
    this.processedImageCount = processedImageCount;
};

JobModel.prototype.incrementProcessImageCounter = function() {
    this.processedImageCount = this.processedImageCount + 1;
};

module.exports = JobModel;