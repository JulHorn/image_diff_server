var ImageMetaInformationModel = require('./model/ImageMetaInformationModel');
var fs = require('fs-extra');
var path = require('path');
var logger = require('winston');
var ImageManipulator = require('./ImageManipulator');
var config = require('./ConfigurationLoader');
var jobHandler = require('./JobHandler');
var CheckAllJobModel = require('./model/job/CheckAllJob');
var DeleteJob = require('./model/job/DeleteJob');
var CheckOneJob = require('./model/job/CheckOneJob');

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
 * @param callback Called when the complete image comparison process is done. Has the updated image meta information model object as job.
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
        new CheckAllJobModel(autoCropValue, pixDiffThresholdValue, distThresholdValue, function (metaInformationModel) {
            logger.info('---------- End ----------', new Date().toISOString());

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

                if (callback) {
                callback(metaInformationModel, isBiggestDistanceDiffThresholdBreached || isBiggestPixelDiffThresholdBreached);
            }
        })
    );
};

/**
 * Makes a new image to a reference image. Updates and save the meta information model.
 *
 * @param id Id of the image set for which the new image should be made a reference image.
 * @param callback Called when the complete deletion process is done. Has the updated image meta information model object as job.
 * **/
ImageManipulatorRepository.prototype.makeToNewReferenceImage = function (id, callback) {
    // Add create diff images job to the job handler
    jobHandler.addJob(
        new CheckOneJob(id, function () {
            if (callback) {
                callback(ImageMetaInformationModel);
            }
        }
    ));
};

/**
 * Deletes an image set. It will be removed from the image meta information structure, the structure will be saved to file
 * and the images will be deleted.
 *
 * @param id The id of the image set.
 * @param callback Called when the complete deletion process is done. Has the updated image meta information model object as job.
 * **/
ImageManipulatorRepository.prototype.deleteImageSetFromModel = function (id, callback) {
    // Add delete job to the job handler
    jobHandler.addJob(
       new DeleteJob(id, function () {
           if (callback) {
               callback(ImageMetaInformationModel);
           }
       }
    ));
};

module.exports = new ImageManipulatorRepository();