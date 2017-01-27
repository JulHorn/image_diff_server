var JobModel = require('./Job');
var fs = require('fs-extra');
var config = require('../ConfigurationLoader');
var path = require('path');

var MakeNewToReferenceImageJob = function (id, callback) {
    this.prototype = new JobModel('Make to new baseline image', callback);
    this.id = id;
};

/* ----- Action ----- */

MakeNewToReferenceImageJob.prototype.execute = function (callback) {
    var that = this;

    // Sinlge option -> Only one image has to be processed
    this.prototype.setImagesToBeProcessedCount(1);

    this.__makeToNewReferenceImage(this.id, function () {
        var jobCreatorCallback = that.prototype.getCallbackFunction();
        // Update the processed image count
        that.prototype.incrementProcessImageCounter();

        /// Call callback of the job creator when stuff is done
        if (jobCreatorCallback) {
            jobCreatorCallback();
        }

        // Notify the job handler that this job is finished
        callback();
    });
};

/**
 * Makes a new image to a reference image. Updates and save the meta information model.
 *
 * @param id Id of the image set for which the new image should be made a reference image.
 * @param callback Called when the complete deletion process is done. Has the updated image meta information model object as job.
 * **/
MakeNewToReferenceImageJob.prototype.__makeToNewReferenceImage = function (id, callback) {
    var imageSet = this.prototype.getMetaInformationModel().getImageSetById(id);
    var that = this;

    // Copy new image to reference image
    fs.copy(imageSet.getNewImage().getPath(), config.getReferenceImageFolderPath() + path.sep + imageSet.getNewImage().getName(), function (err) {

        // Error handling
        if(err){
            throw Error('Failed to copy new image reference images.', err);
        }

        // Create diff -> Autocrop is set to false because the images should be identical
        that.prototype.getImageManipulator().createDiffImage(imageSet.getNewImage().getName(), false, function (resultSet) {
            // Set new diff information to existing image set
            imageSet.setDifference(resultSet.getDifference());
            imageSet.setError(resultSet.getError());
            imageSet.setDistance(resultSet.getDistance());
            imageSet.setReferenceImage(resultSet.getReferenceImage());
            imageSet.setDiffImage(resultSet.getDiffImage());

            // Save meta information
            that.prototype.saveMetaInformation();

            // Call callback
            if(callback){
                callback(that.prototype.getMetaInformationModel());
            }
        });
    });
};

module.exports = MakeNewToReferenceImageJob;