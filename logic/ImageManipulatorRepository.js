var ImageMetaInformationModel = require('./model/ImageMetaInformationModel');
var fs = require('fs-extra');
var path = require('path');
var logger = require('winston');
var ImageManipulator = require('./ImageManipulator');
var config = require('./configurationLoader');
var jobHandler = require('./JobHandler');
var CheckAllJobModel = require('./model/job/CheckAllJob');

/**
 * Constructor.
 * **/
var ImageManipulatorRepository = function () {
    this.imageManipulator = new ImageManipulator();
};

/* ----- Methods ----- */

/**
 * Creates diff images for all images with the same name in the reference/new folders.
 *
 * @param autoCrop
 * @param pixDiffThreshold
 * @param distThreshold
 * @param callback Called when the complete deletion process is done. Has the updated image meta information model object as job.
 * **/
ImageManipulatorRepository.prototype.calculateDifferencesForAllImages = function (autoCrop, pixDiffThreshold, distThreshold, callback) {
    logger.info('---------- Start ----------', new Date().toISOString());
    var autoCropValue = autoCrop ? autoCrop :config.getAutoCropOption();
    var pixDiffThresholdValue = pixDiffThreshold ? pixDiffThreshold : config.getMaxPixelDifferenceThreshold();
    var distThresholdValue = distThreshold ? distThreshold : config.getMaxDistanceDifferenceThreshold();

    logger.info("----- Options Start -----");
    logger.info("Auto cropping is enabled: ", autoCropValue);
    logger.info("Threshold for pixel difference:", pixDiffThresholdValue);
    logger.info("Distance threshold:", distThresholdValue);
    logger.info("----- Options End -----");

    // Clears the old meta information model to start from a clean plate and avoid invalite states
    ImageMetaInformationModel.clear();

    // Add create diff images job to the job handler
    jobHandler.addJob(
        new CheckAllJobModel(this.imageManipulator.createDiffImages, autoCropValue, pixDiffThresholdValue, distThresholdValue, function (metaInformationModel) {
            logger.info('---------- End ----------', new Date().toISOString());
            if (callback) {
                var isBiggestDistanceDiffThresholdBreached = metaInformationModel.getBiggestDistanceDifference() > distThresholdValue;
                var isBiggestPixelDiffThresholdBreached = metaInformationModel.getBiggestPercentualPixelDifference() > pixDiffThresholdValue;

                logger.info("Percentual pixel difference:"
                    + "\nThreshold breached " + isBiggestPixelDiffThresholdBreached
                    + "\nAllowed threshold: " + pixDiffThresholdValue
                    + "\nDifference:" + metaInformationModel.getBiggestPercentualPixelDifference());

                logger.info("Distance difference:"
                    + "\nThreshold breached " + isBiggestDistanceDiffThresholdBreached
                    + "\nAllowed threshold: " + distThresholdValue
                    + "\nDifference:" + metaInformationModel.getBiggestDistanceDifference());

                callback(metaInformationModel, isBiggestDistanceDiffThresholdBreached || isBiggestPixelDiffThresholdBreached);
            }
        })
    );
};

/**
 * Makes a new image to a reference image. Updates and save the meta information model.
 *
 *@param id Id of the image set for which the new image should be made a reference image.
 * @param callback Called when the complete deletion process is done. Has the updated image meta information model object as job.
 * **/
ImageManipulatorRepository.prototype.makeToNewReferenceImage = function (id, callback) {
    var imageSet = ImageMetaInformationModel.getImageSetById(id);
    var that = this;

    logger.info('Attempting to copy ' + imageSet.getNewImage().getPath() + ' to ' + config.getReferenceImageFolderPath() + path.sep + imageSet.getNewImage().getName());

    fs.copy(imageSet.getNewImage().getPath(), config.getReferenceImageFolderPath() + path.sep + imageSet.getNewImage().getName(), function (err) {

        // Error handling
        if(err){
            throw Error('Failed to copy new image reference images.', err);
        }

        // Create diff -> Autocrop is set to false because the images should be identical
        that.imageManipulator.createDiffImage(imageSet.getNewImage().getName(), false, function (resultSet) {
            // Set new diff information to existing image set
            imageSet.setDifference(resultSet.getDifference());
            imageSet.setError(resultSet.getError());
            imageSet.setDistance(resultSet.getDistance());
            imageSet.setReferenceImage(resultSet.getReferenceImage());
            imageSet.setDiffImage(resultSet.getDiffImage());

            // Save meta information
            ImageMetaInformationModel.calculateBiggestDifferences();
            ImageMetaInformationModel.setTimeStamp(new Date().toISOString());
            ImageMetaInformationModel.save();

            // Call callback
            if(callback){
                callback(ImageMetaInformationModel);
            }
        });
    });
};

/**
 * Deletes an image set. It will be removed from the image meta information structure, the structure will be saved to file
 * and the images will be deleted.
 *
 * @param id The id of the image set.
 * @param callback Called when the complete deletion process is done. Has the updated image meta information model object as job.
 * **/
ImageManipulatorRepository.prototype.deleteImageSet = function (id, callback) {
    var imageSet = ImageMetaInformationModel.getImageSetById(id);

    // Delete image which are part of the set
    this.__deleteFile(imageSet.getReferenceImage().getPath());
    this.__deleteFile(imageSet.getNewImage().getPath());
    this.__deleteFile(imageSet.getDiffImage().getPath());

    // Delete information about the data set and save the information
    ImageMetaInformationModel.deleteImageSet(id);
    ImageMetaInformationModel.calculateBiggestDifferences();
    ImageMetaInformationModel.setTimeStamp(new Date().toISOString());
    ImageMetaInformationModel.save();

    logger.info('Deleted image set with id:', id);

    // Call callback when stuff is done
    if(callback){
        callback(ImageMetaInformationModel);
    }
};

/* ----- Helper Methods ----- */

/**
 * Deletes a file.
 *
 * @param path The file which should be deleted.
 * **/
ImageManipulatorRepository.prototype.__deleteFile = function (path) {
    if(this.__isFileExisting(path)){
        fs.unlink(path, function (err) {
            if(err){
                logger.error('Failed to delete file: ' + path, err);
                throw Error('Failed to delete file: ' + path, err);
            }
        });
    }
};

/**
 * Checks if a file exists.
 *
 * @param path The path to a file.
 * @return True if the file exists, else false.
 * **/
ImageManipulatorRepository.prototype.__isFileExisting = function (path) {
  try{
    fs.accessSync(path);
  } catch(err) {
      return false;
  }

  return true;
};

module.exports = new ImageManipulatorRepository();