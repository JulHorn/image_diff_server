var ImageManipulator = require('../ImageManipulator');
var imageMetaInformationModel = require('../model/ImageMetaInformationModel');

/**
 * Creates a new general job.
 *
 * @param jobName The name of the jjob. Used for descriptional purposes.
 * @param callback The callback which will be called when the execution of this job has finished.
 * **/
var Job = function(jobName, callback) {
    this.jobName = jobName;
    this.callback = callback;
    this.processedImageCount = 0;
    this.imagesToBeProcessedCount = 0;
    this.imageManipulator = new ImageManipulator();
    this.imageMetaInformationModel = new imageMetaInformationModel();
};

/* ----- Action ----- */

Job.prototype.execute = function (imageMetaInformationModel, callback) {
  // Do nothing -> Log empty execution?
    // ToDo: Call callback

    that.imageMetaInformationModel = imageMetaInformationModel;
    // Make the reference of the model to a copy for individual information storage
    this.__copyImageMetaInformationModel();
};

/* ----- Getter ----- */

/**
 * Returns the name of the job.
 *
 * @return Returns the name of the job.
 * **/
Job.prototype.getJobName = function () {
    return this.jobName;
};

/**
 * Returns the callback function which will be given as parameter to the executed job execution.
 *
 * @return Returns the callback function which will be given as parameter to the executed job execution.
 * **/
Job.prototype.getCallbackFunction = function () {
    return this.callback;
};

/**
 * Returns the object to manipulate images/create diffs.
 *
 * @return Returns the object to manipulate images/create diffs.
 * **/
Job.prototype.getImageManipulator = function () {
  return this.imageManipulator;
};

Job.prototype.getImageMetaInformationModel = function () {
  return this.imageMetaInformationModel;
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

/* ----- Helper ----- */

/**
 * Calculates the the biggest percentual pixel difference/distance and sets the timestamp.
 * **/
Job.prototype.calculateMetaInformation = function () {
    this.imageMetaInformationModel.calculateBiggestDifferences();
    this.imageMetaInformationModel.setTimeStamp(new Date().toISOString());
};

Job.prototype.__load = function (data) {
    this.jobName = data.jobName;
    this.processedImageCount = data.processedImageCount;
    this.imagesToBeProcessedCount = data.imagesToBeProcessedCount;
    this.imageMetaInformationModel = new imageMetaInformationModel();
    this.imageMetaInformationModel.load(data.imageMetaInformationModel);
};

Job.prototype.__copyImageMetaInformationModel = function () {
    this.imageMetaInformationModel = this.getImageMetaInformationModel().getCopy();
};

module.exports = Job;