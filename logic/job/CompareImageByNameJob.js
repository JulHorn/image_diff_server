var Job = require('./Job');
var fs = require('fs-extra');
var config = require('../ConfigurationLoader');
var path = require('path');

/**
 * Job which computes the difference of two images by image names and updates the ImageMetaInformationModel accordingly.
 *
 * @param {String} imageName The name of the image.
 * @param {String} imageType The type of the image (png, ...)
 * @param {String} imageBase64 The base 64 encoded image.
 * @param {Function} callback The callback method which is called, when diff process has finished. Has the this job as parameter.
 * @constructor
 * **/
var CompareImageByNameJob = function (imageName, imageType, imageBase64, callback) {
    Job.call(this, 'CompareImageByNameJob', callback);
    this.imageName = imageName;
    this.imageType = imageType;
    this.imageBase64 = imageBase64;
};

// Do inheritance
CompareImageByNameJob.prototype = Object.create(Job.prototype);

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param {ImageMetaInformationModel} imageMetaInformationModel The image meta model in which the results will be saved.
 * @param {Function} callback The callback which will be called after the job execution is finished.
 * **/
CompareImageByNameJob.prototype.execute = function (imageMetaInformationModel, callback) {
    var that = this;
    that.imageMetaInformationModel = imageMetaInformationModel;
    // Single option -> Only one image has to be processed
    this.setImagesToBeProcessedCount(1);

    // Save the image to disc and compare it
    this.__saveAndCompareImage(this.imageName, this.imageType, this.imageBase64, function (resultImageSet) {
        var jobCreatorCallback = that.getCallbackFunction();
        // Update the processed image count
        that.incrementProcessImageCounter();

        // Make the reference of the model to a copy to have a snapshot which will not be changed anymore
        that.copyImageMetaInformationModel();

        /// Call callback of the job creator when stuff is done
        if (jobCreatorCallback) {
            jobCreatorCallback(that, resultImageSet);
        }

        // Notify the job handler that this job is finished
        callback();
    });
};

/**
 * Loads the data into this job. Used to restore a previous state of this object.
 *
 * @param {Object} data The object containing the information which this object should habe.
 * **/
CompareImageByNameJob.prototype.load = function (data) {
    // Load data in the prototype
    this.loadJobData(data);

    this.id = data.id;
};

// ToDo: Refactor this method to do only one thing at once
/**
 * Saves the given image to disc and compares it to the reference image after that.
 *
 * @param {String} imageName The name of the image.
 * @param {String} imageType The type of the image (png, ...)
 * @param {String} imageBase64 The base 64 encoded image.
 * @param {Function} callback Called when the complete deletion process is done. Has the updated image imageMetaInformationModel information model object as job.
 * **/
CompareImageByNameJob.prototype.__saveAndCompareImage = function (imageName, imageType, imageBase64, callback) {
    var fullImageName = imageName + '.' + imageType;
    var that = this;
    var filePath = config.getNewImageFolderPath() + path.sep + fullImageName;


    // Remove base64 header so that the image can be written to disc properly
    imageBase64 = imageBase64.split(';base64,').pop();

    // Write the base64 image as a real image to disc
    fs.writeFile(filePath, imageBase64, { encoding: 'base64' }, function (err) {

        // Error handling
        if(err){
            throw Error('Failed to image ' + imageName + '.' + imageType + ' to ' + filePath, err);
        }

        // Compare if image set exists, else simply create a new image set
        // New image should always exist because it was just given
        var isReferenceImageExisting = that.getImageManipulator().isImageExisting(config.getReferenceImageFolderPath() + path.sep + fullImageName);
        if(isReferenceImageExisting) {
            var imageSet = that.getImageMetaInformationModel().getImageSetByName(fullImageName);
            var ignoreAreas = imageSet ? imageSet.getIgnoreAreas() : [];

            that.getImageManipulator().createDiffImage(fullImageName, false, ignoreAreas, function (resultSet) {
                // Compare
                that.getImageMetaInformationModel().addImageSet(resultSet);
                that.calculateMetaInformation();

                // Call callback
                if(callback){
                    callback(resultSet);
                }
            });

        } else {
            that.getImageManipulator().loadImage(filePath, function (err, newImage) {
                var resultImageSet = that.getImageManipulator().createSingleImageSet(fullImageName, newImage, 'There is no reference image existing yet.', false);
                that.getImageMetaInformationModel().addImageSet(resultImageSet);

                // Call callback
                if(callback){
                    callback(resultImageSet);
                }
            });
        }

    });
};

module.exports = CompareImageByNameJob;