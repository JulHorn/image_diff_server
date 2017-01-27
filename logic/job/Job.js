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
    this.imageMetaInformationModel = imageMetaInformationModel;
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
 * Calculates the the biggest percentual pixel difference/distance, sets the timestamp and saves the image imageMetaInformationModel information structure
 * to file.
 * **/
Job.prototype.saveMetaInformation = function () {
    imageMetaInformationModel.calculateBiggestDifferences();
    imageMetaInformationModel.setTimeStamp(new Date().toISOString());
    imageMetaInformationModel.save();
};

module.exports = Job;