var ImageManipulator = require('../ImageManipulator');
var imageMetaInformationModel = require('../model/ImageMetaInformationModel');

var Job = function(jobName, callback) {
    this.jobName = jobName;
    this.callback = callback;
    this.processedImageCount = 0;
    // Expect that only one image has to be processed as default and change the number in the method in which more than
    // one image should be processed (e.g. check all images etc.)
    this.imagesToBeProcessedCount = 1;
    this.imageManipulator = new ImageManipulator();
};

/*
 um die js vererbung noch mal schön auf dem papier zu sehen - so kann das dann aussehen...
 var Job = function() {}
 Job.prototype.foo ...
 var Job = require('/Job')
 var SpecialJob = function() {
 Job.call()
 }
 SpecialJob.prototype = Object.create(Job.prototype)






 var WidgetBase = function($widgetContainer, widgetSetup) {
 this.widgetSetup = widgetSetup;
 this.$widgetContainer = $widgetContainer;
 ...
 this.init();
 this.bindEvents();
 }
 WidgetBase.prototype.init = function() {
 ...
 }
 WidgetBase.prototype.bindEvents = function() {
 ...
 }
 var WidgetBase = require('/base');
 var Widget = function($widgetContainer, widgetSetup) {
 WidgetBase.call(this, $widgetContainer, widgetSetup);
 };
 Widget.prototype = Object.create(WidgetBase.prototype);
*/


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

Job.prototype.getImageMetaInformationModel = function () {
  return imageMetaInformationModel;
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
 * Calculates the the biggest percentual pixel difference/distance, sets the timestamp and saves the image meta information structure
 * to file.
 * **/
Job.prototype.saveMetaInformation = function () {
    imageMetaInformationModel.calculateBiggestDifferences();
    imageMetaInformationModel.setTimeStamp(new Date().toISOString());
    imageMetaInformationModel.save();
};

module.exports = Job;