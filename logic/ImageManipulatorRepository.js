var ImageMetaInformationModel = require('./model/ImageMetaInformationModel');
var CheckAllJobModel = require('./job/CheckAllJob');
var DeleteJob = require('./job/DeleteJob');
var MakeToNewReferenceImageJob = require('./job/MakeNewToReferenceImageJob');
var ModifyIgnoreAreasJob = require('./job/ModifyIgnoreAreasJob');
var ImageManipulator = require('./ImageManipulator');
var fs = require('fs-extra');
var path = require('path');
var logger = require('winston');
var config = require('./ConfigurationLoader');
var jobHandler = require('./JobHandler');

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
 * @param callback Called when the complete image comparison process is done. Has the updated image imageMetaInformationModel information model object as job.
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

    // Add create diff images job to the job handler
    jobHandler.addJob(
        new CheckAllJobModel(autoCropValue, pixDiffThresholdValue, distThresholdValue, function (job) {
            logger.info('---------- End ----------', new Date().toISOString());

            var isBiggestDistanceDiffThresholdBreached = job.getImageMetaInformationModel().getBiggestDistanceDifference() > distThresholdValue;
            var isBiggestPixelDiffThresholdBreached = job.getImageMetaInformationModel().getBiggestPercentualPixelDifference() > pixDiffThresholdValue;

            logger.info("Percentual pixel difference:"
                + "\nThreshold breached " + isBiggestPixelDiffThresholdBreached
                + "\nAllowed threshold: " + pixDiffThresholdValue
                + "\nDifference:" + job.getImageMetaInformationModel().getBiggestPercentualPixelDifference());

            logger.info("Distance difference:"
                + "\nThreshold breached " + isBiggestDistanceDiffThresholdBreached
                + "\nAllowed threshold: " + distThresholdValue
                + "\nDifference:" + job.getImageMetaInformationModel().getBiggestDistanceDifference());

                if (callback) {
                callback(job, isBiggestDistanceDiffThresholdBreached || isBiggestPixelDiffThresholdBreached);
            }
        })
    );
};

/**
 * Makes a new image to a reference image. Updates and save the imageMetaInformationModel information model.
 *
 * @param id Id of the image set for which the new image should be made a reference image.
 * @param callback Called when the complete deletion process is done. Has the updated image imageMetaInformationModel information model object as job.
 * **/
ImageManipulatorRepository.prototype.makeToNewReferenceImage = function (id, callback) {
    // Add create diff images job to the job handler
    jobHandler.addJob(
        new MakeToNewReferenceImageJob(id, function (job) {
            if (callback) {
                callback(job);
            }
        }
    ));
};

/**
 * Deletes an image set. It will be removed from the image imageMetaInformationModel information structure, the structure will be saved to file
 * and the images will be deleted.
 *
 * @param id The id of the image set.
 * @param callback Called when the complete deletion process is done. Has the updated image imageMetaInformationModel information model object as job.
 * **/
ImageManipulatorRepository.prototype.deleteImageSetFromModel = function (id, callback) {
    // Add delete job to the job handler
    jobHandler.addJob(
       new DeleteJob(id, function (job) {
           if (callback) {
               callback(job);
           }
       }
    ));
};

/**
 * Returns the currently active job or if no job was active, the last executed job.
 *
 * @param callback The callback which the the currently active job or if no job was active, the last executed job as a parameter.
 * **/
ImageManipulatorRepository.prototype.getLastActiveJob = function (callback) {
    callback(jobHandler.getLastActiveJob());
};

ImageManipulatorRepository.prototype.modifyIgnoreAreas = function (id, ignoreAreas, callback) {
    // Add modify ignore areas job to the job handler
    try {
        jobHandler.addJob(
            new ModifyIgnoreAreasJob(id, ignoreAreas, function (job) {
                    if (callback) {
                        callback(job);
                    }
                }
            ));
    } catch (exc) { console.log('Error:', exc); }
};

ImageManipulatorRepository.prototype.getImageSet = function (id, callback) {
   var resultImageSet = jobHandler.getLastActiveJob().getImageMetaInformationModel().getImageSetById(id);

    callback(resultImageSet);
};

module.exports = new ImageManipulatorRepository();