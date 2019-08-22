var ImageManipulator = require('../ImageManipulator');
var ImageMetaInformationModel = require('../model/ImageMetaInformationModel');
var logger = require('winston');
var dateFormat = require('dateformat');

/**
 * Creates a new general job.
 *
 * @param {String} jobName The name of the job.
 * @param {Function} callback The callback which will be called when the execution of this job has finished.
 * **/
var Job = function(jobName, callback) {
    this.jobName = jobName;
    this.callback = callback;
    this.processedImageCount = 0;
    this.imagesToBeProcessedCount = 0;
    this.imageManipulator = new ImageManipulator();
    this.imageMetaInformationModel = new ImageMetaInformationModel();
};

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param {ImageMetaInformationModel} imageMetaInformationModel The image meta model in which the results will be saved.
 * @param {Function} callback The callback which will be called after the job execution is finished.
 * **/
Job.prototype.execute = function (imageMetaInformationModel, callback) {
   logger.info('Executing empty job. Does nothing.');

    if(callback) {
        callback();
    }

    that.imageMetaInformationModel = imageMetaInformationModel;
    // Make the reference of the model to a copy for individual information storage
    this.copyImageMetaInformationModel();
};

/* ----- Getter ----- */

/**
 * Returns the name of the job.
 *
 * @return {String} Returns the name of the job.
 * **/
Job.prototype.getJobName = function () {
    return this.jobName;
};

/**
 * Returns the callback function which will be given as parameter to the executed job execution.
 *
 * @return {Function} Returns the callback function which will be given as parameter to the executed job execution.
 * **/
Job.prototype.getCallbackFunction = function () {
    return this.callback;
};

/**
 * Returns the object to manipulate images/create diffs.
 *
 * @return {ImageManipulator} Returns the object to manipulate images/create diffs.
 * **/
Job.prototype.getImageManipulator = function () {
  return this.imageManipulator;
};

/**
 * Returns the image meta model which this job used.
 *
 * @return {ImageMetaInformationModel} Returns the image meta model which this job used.
 * **/
Job.prototype.getImageMetaInformationModel = function () {
  return this.imageMetaInformationModel;
};

/* ----- Setter/Adder ----- */

/**
 * Sets the amount of images this job has to process in total. Only used as information and not as a computacional factor.
 *
 * @param {Number} imagesToBeProcessedCount The amount of images this job has to process in total.
 * **/
Job.prototype.setImagesToBeProcessedCount = function(imagesToBeProcessedCount) {
    this.imagesToBeProcessedCount = imagesToBeProcessedCount;
};

/**
 * Sets the amount of images this job already has processed. Only used as information and not as a computacional factor.
 *
 * @param {Number} processedImageCount The amount of images this job already has processed
 * **/
Job.prototype.setProcessedImageCount = function(processedImageCount) {
    this.processedImageCount = processedImageCount;
};

/**
 * Increments the amount of already procressed images by one.
 * **/
Job.prototype.incrementProcessImageCounter = function() {
    this.processedImageCount = this.processedImageCount + 1;
};

/**
 * Calculates the the biggest percentual pixel difference/distance and sets the timestamp.
 * **/
Job.prototype.calculateMetaInformation = function () {
    var currentDate = new Date();

    this.imageMetaInformationModel.calculateBiggestDifferences();
    this.imageMetaInformationModel.setTimeStamp(dateFormat(currentDate, 'HH:MM:ss dd.mm.yyyy'));
};

/**
 * Loads the data into this job. Used to restore a previous state of this object.
 *
 * @param {Object} data The object containing the information which this object should habe.
 * **/
Job.prototype.loadJobData = function (data) {
    this.jobName = data.jobName;
    this.processedImageCount = data.processedImageCount;
    this.imagesToBeProcessedCount = data.imagesToBeProcessedCount;
    this.imageMetaInformationModel = new ImageMetaInformationModel();
    this.imageMetaInformationModel.load(data.imageMetaInformationModel);
};

/**
 * Makes a copy of currently image meta model of this job and sets it as its new meta model in order kill the reference.
 * Use this method if the job execution has finished and the image meta model should not be changed for this job.
 * **/
Job.prototype.copyImageMetaInformationModel = function () {
    this.imageMetaInformationModel = this.getImageMetaInformationModel().getCopy();
};

/**
 * Clones this job to kill the references.
 *
 * @return A clone of this job object.
 */
Job.prototype.getCopy = function () {
    var clonedJob = new Job('', null);

    clonedJob.loadJobData(this);

    return clonedJob;
};

module.exports = Job;