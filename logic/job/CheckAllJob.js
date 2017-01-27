var Job = require('./Job');
var config = require('../ConfigurationLoader');
var path = require('path');
var logger = require('winston');
var fs = require('fs-extra');

/**
 * Job which computes diff images for all images with the same name in the reference/new folder (configured in the config file). The diff images will
 * written in the diff image folder. Updated the meta structure.
 *
 * @param autoCrop Determines if the new/reference images should be autocroped before comparison to yield better results if the sometimes differ in size. Must be a boolean.
 * @param pixDiffThreshold The pixel threshold.
 * @param distThreshold The distance threshold.
 * @param callback The callback method which is called, when diff process as finished. Has the imageMetaInformationModel as job. Optional.
 * **/
var CheckAllJob = function (autoCrop, pixDiffThreshold, distThreshold, callback) {
    this.prototype = new Job('Check All', callback);
    this.autoCrop = autoCrop;
    this.pixDiffThreshold = pixDiffThreshold;
    this.distThreshold = distThreshold;
};

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param callback The callback which will be called after the job execution is finished.
 * **/
CheckAllJob.prototype.execute = function (callback) {
    var that = this;

    this.createDiffImages(this.autoCrop, this.pixDiffThreshold, this.distThreshold, function () {
        var jobCreatorCallback = that.prototype.getCallbackFunction();

        /// Call callback of the job creator when stuff is done
        if (jobCreatorCallback) {
            jobCreatorCallback(that.prototype.getImageMetaInformationModel());
        }

        // Notify the job handler that this job is finished
        callback();
    });
};

/**
 * Computes diff images for all images with the same name in the reference/new folder (configured in the config file). The diff images will
 * written in the diff image folder. Updated the meta structure.
 *
 * @param autoCrop Determines if the new/reference images should be autocroped before comparison to yield better results if the sometimes differ in size. Must be a boolean.
 * @param pixDiffThreshold The pixel threshold.
 * @param distThreshold The distance threshold.
 * @param callback The callback method which is called, when diff process as finished. Has the imageMetaInformationModel as job. Optional.
 * **/
CheckAllJob.prototype.createDiffImages = function (autoCrop, pixDiffThreshold, distThreshold, callback) {
    var that = this;

    // Ensure that the folders which should contain the images exist
    fs.ensureDirSync(config.getReferenceImageFolderPath());
    fs.ensureDirSync(config.getNewImageFolderPath());

    logger.info("Trying to load reference images from:", config.getReferenceImageFolderPath());
    logger.info("Trying to load new images from:", config.getNewImageFolderPath());

    // Read supported images
    var refImageNames = fs.readdirSync(config.getReferenceImageFolderPath()).filter(this.__imageFilter);
    var newImageNames = fs.readdirSync(config.getNewImageFolderPath()).filter(this.__imageFilter);

    logger.info("Reference images loaded:", refImageNames.length);
    logger.info("New images loaded:", newImageNames.length);

    // Get images that exist in both or only in one folder
    var imageNames = this.__getImageNames(refImageNames, newImageNames, false);
    var refDiffImageNames = this.__getImageNames(refImageNames, newImageNames, true);
    var newDiffImageNames = this.__getImageNames(newImageNames, refImageNames, true);

    // Tell the job how many images have to be processed
    this.prototype.setImagesToBeProcessedCount(refDiffImageNames.length + newDiffImageNames.length + imageNames.length);

    // Create diff images
    this.__createSingleImages(refDiffImageNames, newDiffImageNames, function () {
        that.__createDiffImages(imageNames, autoCrop, pixDiffThreshold, distThreshold, function () {
            that.prototype.saveMetaInformation();
            if(callback) {
                callback(that.prototype.getImageMetaInformationModel());
            }
        });
    });
};

/**
 * Creates diff images of images with the same name in the reference/new folder.
 * Updates the image meta information structure, but does not save it.
 *
 * @param imageNames Array of image names which should be compared.
 * @param autoCrop Determines if the new/reference images should be autocroped before comparison to yield better results if the sometimes differ in size. Must be a boolean.
 * @param pixDiffThreshold
 * @param distThreshold
 * @param callback Will be called, when the method has finished to compute all images. Has the number of processed images as job.
 * **/
CheckAllJob.prototype.__createDiffImages = function (imageNames, autoCrop, pixDiffThreshold, distThreshold, callback) {

    logger.info("Number of images left to compare: ", imageNames.length);
    // If no images are left to process, call the callback method and stop
    if(imageNames.length == 0) {
        logger.info('No images left to compare.');
        if(callback){
            callback();
        }

    } else {

        // Create diff image
        var imageToProcess = imageNames.shift();
        var that = this;
        //this.prototype.incrementProcessImageCounter();
        that.prototype.getImageManipulator().createDiffImage(imageToProcess, autoCrop, function (resultSet) {
            // Only add images if a a threshold was breached
            if (resultSet.getDistance() > distThreshold
                || resultSet.getDifference() > pixDiffThreshold) {
                that.imageMetaInformationModel.addImageSet(resultSet);
            }

            // Increase the number of processed images by one
            that.prototype.incrementProcessImageCounter();

            that.__createDiffImages(imageNames, autoCrop, pixDiffThreshold, distThreshold, callback);
        });
    }
};

/**
 * Adds images with new reference/new pedant to the image meta information structure.
 * Updates the image meta information structure, but does not save it.
 *
 * @param refImageNames Array of image names which exist in the reference image folder, but not in the new image folder.
 * @param newImageNames Array of image names which exist in the new image folder, but not in the new reference folder.
 * @param callback Will be called, when the method has finished to compute all images. Has the number of processed images as job.
 * **/
CheckAllJob.prototype.__createSingleImages = function (refImageNames, newImageNames, callback) {
    var that = this;

    if(refImageNames.length == 0 && newImageNames.length == 0) {
        logger.info('No single images left to process.');
        callback();
    } else {

        logger.info('Single images left to process:', refImageNames.length + newImageNames.length);

        // New and ref images
        if(newImageNames.length > 0) {
            var newImageName = newImageNames.shift();

            this.prototype.getImageManipulator().loadImage(config.getNewImageFolderPath() + path.sep + newImageName, function (err, newImage) {
                that.prototype.getImageMetaInformationModel().addImageSet(that.prototype.getImageManipulator().createSingleImageSet(newImageName, newImage, 'There is no reference image existing yet.', false));

                // Increase the number of processed images by one
                that.prototype.incrementProcessImageCounter();

                that.__createSingleImages(refImageNames, newImageNames, callback);
            });
        } else if(refImageNames.length > 0) {
            var refImageName = refImageNames.shift();

            // Reference images
            this.prototype.getImageManipulator().loadImage(config.getReferenceImageFolderPath() + path.sep + refImageName, function (err, refImage) {
                that.prototype.getImageMetaInformationModel().addImageSet(that.prototype.getImageManipulator().createSingleImageSet(refImageName, refImage, 'There is no new image existing. Reference outdated?', true));

                // Increase the number of processed images by one
                that.prototype.incrementProcessImageCounter();

                that.__createSingleImages(refImageNames, newImageNames, callback);
            });
        }
    }
};

/* ----- Getter ----- */

/**
 * Returns true if the auto crop function is enabled, else false.
 *
 * @return Returns true if the auto crop function is enabled, else false.
 * **/
CheckAllJob.prototype.isAutoCropEnabled = function () {
    return this.autoCrop;
};

/**
 * Returns the maximum allowed pixel threshold. The return value is between 0 and 1.
 *
 * @return Returns the maximum allowed pixel threshold. The return value is between 0 and 1.
 * **/
CheckAllJob.prototype.getMaxPixelDifferenceThreshold = function () {
  return this.pixDiffThreshold;
};

/**
 * Returns the maximum allowed distance threshold. The return value is between 0 and 1.
 *
 * @return Returns the maximum allowed distance threshold. The return value is between 0 and 1.
 * **/
CheckAllJob.prototype.getMaxDistanceDifferenceThreshold = function () {
    return this.distThreshold;
};

/* ----- Helper ----- */

/**
 * A simple filter function for arrays to determine wheter a file is one of the supported image types.
 *
 * @param imageName The image name including its type suffix.
 * **/
CheckAllJob.prototype.__imageFilter = function (imageName) {
    return imageName.toLowerCase().endsWith('.png');
};

/**
 * Gets the images which are in one array and not the other or which in both arrays.
 *
 * @param fileNameArray1 The first array.
 * @param fileNameArray2 The second array.
 * @param differentImages If true, returns the the images which are in array 1 and not array 2. If false, returns the images
 * which are in both arrays.
 * **/
CheckAllJob.prototype.__getImageNames = function(fileNameArray1, fileNameArray2, differentImages){

    // Get the images that are only in the first array
    if(differentImages){
        return fileNameArray1.filter(function(element){
            return !fileNameArray2.includes(element);
        });
    }

    // Get the images that are in both arrays
    return fileNameArray1.filter(function(element){
        return fileNameArray2.includes(element);
    });
};

module.exports = CheckAllJob;