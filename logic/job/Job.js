var ImageManipulator = require('./../ImageManipulator');

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
    // Expect that only one image has to be processed as default and change the number in the method in which more than
    // one image should be processed (e.g. check all images etc.)
    this.imagesToBeProcessedCount = 1;
    this.imageManipulator = new ImageManipulator();
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
 * Returns the number of images which still need to be processed.
 *
 * @return Returns the number of images which still need to be processed.
 * **/
Job.prototype.getImagesToBeProcessedCount = function () {
    return this.imagesToBeProcessedCount;
};

/**
 * Returns the number of images will be processed in total.
 *
 * @return Returns the number of images will be processed in total.
 * **/
Job.prototype.getProcessedImageCount = function () {
    return this.processedImageCount;
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

/* ----- Setter/Adder ----- */

/**
 * Sets the total amount of images which will be processed in this job.
 *
 * @param imagesToBeProcessedCount Total amount of images which will be processed in this job.
 * **/
Job.prototype.setImagesToBeProcessedCount = function(imagesToBeProcessedCount) {
    this.imagesToBeProcessedCount = imagesToBeProcessedCount;
};

/**
 * Sets the already processed amount images in this job.
 *
 * @param processedImageCount Already processed amount images in this job.
 * **/
Job.prototype.setProcessedImageCount = function(processedImageCount) {
    this.processedImageCount = processedImageCount;
};

/**
 * Increases the amount of processed images by 1.
 * **/
Job.prototype.incrementProcessImageCounter = function() {
    this.processedImageCount = this.processedImageCount + 1;
};

module.exports = Job;