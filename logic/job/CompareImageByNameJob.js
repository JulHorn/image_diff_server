var Job = require('./Job');
var fs = require('fs-extra');
var config = require('../ConfigurationLoader');
var path = require('path');

/**
 *
 *
 * @param {String} imageName
 * @param {String} imageType
 * @param {String} imageBase64
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

    this.__saveAndCompareImage(this.imageName, this.imageType, this.imageBase64, function () {
        var jobCreatorCallback = that.getCallbackFunction();
        // Update the processed image count
        that.incrementProcessImageCounter();

        // Make the reference of the model to a copy to have a snapshot which will not be changed anymore
        that.copyImageMetaInformationModel();

        /// Call callback of the job creator when stuff is done
        if (jobCreatorCallback) {
            jobCreatorCallback(that);
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

/**
 *
 *
 * @param {String} imageName
 * @param {String} imageType
 * @param {String} imageBase64
 * @param {Function} callback Called when the complete deletion process is done. Has the updated image imageMetaInformationModel information model object as job.
 * **/
CompareImageByNameJob.prototype.__saveAndCompareImage = function (imageName, imageType, imageBase64, callback) {
    var fullImageName = imageName + '.' + imageType;
    var imageSet = this.getImageMetaInformationModel().getImageSetByName(fullImageName);
    var that = this;
    var filePath = '';

    if(imageSet) {
        filePath = imageSet.getNewImage().getPath();
    } else {
        filePath = config.getNewImageFolderPath() + path.sep + fullImageName;
    }
    imageBase64 = imageBase64.split(';base64,').pop();
    // Copy new image to reference image
    fs.writeFile(filePath, imageBase64, { encoding: 'base64' }, function (err) {

        // Error handling
        if(err){
            throw Error('Failed to image ' + imageName + '.' + imageType + ' to ' + filePath, err);
        }

        if (imageSet) {
            // Keep values intact instead of the more basic error message of the comparison method if reference image does not exist
            // New image should always exist because it was just given
            var isReferenceImageExisting = that.getImageManipulator().isImageExisting(config.getReferenceImageFolderPath() + path.sep + fullImageName);
            if(isReferenceImageExisting) {
                that.getImageManipulator().createDiffImage(fullImageName, false, [], function (resultSet) {

                    that.getImageMetaInformationModel().addImageSet(resultSet);

                    // Save imageMetaInformationModel information
                    that.calculateMetaInformation();

                    // Call callback
                    if(callback){
                        callback();
                    }
                });

            } else {
                // Call callback
                if(callback){
                    callback();
                }
            }
        } else {
            that.getImageManipulator().loadImage(filePath, function (err, newImage) {
                var resultImageSet = that.getImageManipulator().createSingleImageSet(fullImageName, newImage, 'There is no reference image existing yet.', false);
                that.getImageMetaInformationModel().addImageSet(resultImageSet);

                // Call callback
                if(callback){
                    callback();
                }
            });
        }

    });
};

module.exports = CompareImageByNameJob;