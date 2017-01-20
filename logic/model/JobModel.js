var JobModel = function(jobName, jobFunction, functionParameters, callback, callbackParameters) {
    this.jobName = jobName;
    this.jobFunction = jobFunction;
    this.functionParameters = functionParameters;
    this.callback = callback;
    this.callbackParameters = callbackParameters;
    this.processedImageCount = 0;
    this.imagesToBeProcessedCount = 0;
};

/* ----- Getter ----- */

JobModel.prototype.getImagesToBeProcessedCount = function () {
    return this.imagesToBeProcessedCount;
};

JobModel.prototype.getProcessedImageCount = function () {
    return this.processedImageCount;
};

JobModel.prototype.getJobFunction = function () {
    return this.jobFunction;
};

JobModel.prototype.getJobFunctionParameters = function () {
    return this.getJobFunctionParameters();
};

JobModel.prototype.getCallback = function () {
    return this.callback;
};

JobModel.prototype.getCallbackParameters = function () {
    return this.callbackParameters;
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