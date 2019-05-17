var Job = require('./Job');
var fs = require('fs-extra');
var config = require('../ConfigurationLoader');
var path = require('path');

/**
 * Job which computes the difference of two images and updates the image meta model accordingly..
 *
 * @param {String} id The id of the image set of which the new image should be made a reference image.
 * @param {Function} callback The callback method which is called, when diff process has finished. Has the this job as parameter.
 * @constructor
 * **/
var MakeNewToReferenceImageJob = function (id, callback) {
    Job.call(this, 'MakeToNewBaselineImage', callback);
    this.id = id;
};

// Do inheritance
MakeNewToReferenceImageJob.prototype = Object.create(Job.prototype);

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param {ImageMetaInformationModel} imageMetaInformationModel The image meta model in which the results will be saved.
 * @param {Function} callback The callback which will be called after the job execution is finished.
 * **/
MakeNewToReferenceImageJob.prototype.execute = function (imageMetaInformationModel, callback) {
    var that = this;
    that.imageMetaInformationModel = imageMetaInformationModel;
    // Single option -> Only one image has to be processed
    this.setImagesToBeProcessedCount(1);

    this.__saveAndCompareImage(this.id, function (updatedImageSet) {
        var jobCreatorCallback = that.getCallbackFunction();
        // Update the processed image count
        that.incrementProcessImageCounter();

        // Make the reference of the model to a copy to have a snapshot which will not be changed anymore
        that.copyImageMetaInformationModel();

        /// Call callback of the job creator when stuff is done
        if (jobCreatorCallback) {
            jobCreatorCallback(that, updatedImageSet);
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
MakeNewToReferenceImageJob.prototype.load = function (data) {
    // Load data in the prototype
    this.loadJobData(data);

    this.id = data.id;
};

/**
 * Makes a new image to a reference image. Updates and save the imageMetaInformationModel information model.
 *
 * @param {String} id Id of the image set for which the new image should be made a reference image.
 * @param {Function} callback Called when the complete process is done. Has the updated image imageSet object as parameter.
 * **/
MakeNewToReferenceImageJob.prototype.__saveAndCompareImage = function (id, callback) {
    var imageSet = this.getImageMetaInformationModel().getImageSetById(id);
    var that = this;

    // Copy new image to reference image
    fs.copy(imageSet.getNewImage().getPath(), config.getReferenceImageFolderPath() + path.sep + imageSet.getNewImage().getName(), function (err) {

        // Error handling
        if(err){
            throw Error('Failed to copy new image reference images.', err);
        }

        // Create diff -> Autocrop is set to false because the images should be identical
        that.getImageManipulator().createDiffImage(imageSet.getNewImage().getName(), false, imageSet.getIgnoreAreas(), imageSet.getCheckAreas(), function (resultSet) {
            // Keep the id to make the image set behaviour consistent
            resultSet.setId(imageSet.getId());
            that.imageMetaInformationModel.addImageSet(resultSet);

            // Save imageMetaInformationModel information
            that.calculateMetaInformation();

            // Call callback
            if(callback){
                callback(imageSet);
            }
        });
    });
};

module.exports = MakeNewToReferenceImageJob;