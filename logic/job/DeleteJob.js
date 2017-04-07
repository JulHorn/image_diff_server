var Job = require('./Job');

/**
 * Deletes all images of an image set and updates the image meta model accordingly.
 *
 * @param {String} id The id of the image set.
 * @param {Function} callback The callback method which is called, when diff process has finished. Has the this job as parameter.
 * @constructor
 * **/
var DeleteJob = function (id, callback) {
    Job.call(this, 'DeleteSet', callback);
    this.id = id;
};

// Do inheritance
DeleteJob.prototype = Object.create(Job.prototype);

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param imageMetaInformationModel The image meta model in which the results will be saved.
 * @param callback The callback which will be called after the job execution is finished.
 * **/
DeleteJob.prototype.execute = function (imageMetaInformationModel, callback) {
    this.imageMetaInformationModel = imageMetaInformationModel;
    var imageSet = this.getImageMetaInformationModel().getImageSetById(this.id);
    var that = this;

    // Sinlge option -> Only one image has to be processed
    this.setImagesToBeProcessedCount(1);

    // Delete images
    this.getImageManipulator().deleteImageSetImages(imageSet, function () {
        that.deleteImageSetFromModel(that.id, function () {
            var jobCreatorCallback = that.getCallbackFunction();

            // Make the reference of the model to a copy to have a snapshot which will not be changed anymore
            that.copyImageMetaInformationModel();

            if(jobCreatorCallback) {
                jobCreatorCallback(that);
            }
        });

        // Notify the job handler that this job is finished
        callback();
    });
};

/**
 * Deletes an image set. It will be removed from the image imageMetaInformationModel information structure, the structure will be saved to file
 * and the images will be deleted.
 *
 * @param id The id of the image set.
 * @param callback Called when the complete deletion process is done. Has the updated image imageMetaInformationModel information model object as parameter.
 * **/
DeleteJob.prototype.deleteImageSetFromModel = function (id, callback) {
    // Delete information about the data set and save the information
    this.getImageMetaInformationModel().deleteImageSetFromModel(id);
    this.calculateMetaInformation();

    // One image set was deleted -> Update job process state
    this.incrementProcessImageCounter();

    // Call callback of the job creator when stuff is done
    if(callback){
        callback();
    }
};

/**
 * Loads the data into this job. Used to restore a previous state of this object.
 *
 * @param data The object containing the information which this object should habe.
 * **/
DeleteJob.prototype.load = function (data) {
    // Load data in the prototype
    this.loadJobData(data);

    this.id = data.id;
};

module.exports = DeleteJob;