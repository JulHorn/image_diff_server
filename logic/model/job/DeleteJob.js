var JobModel = require('./JobModel');

var DeleteJob = function (id, callback) {
    this.prototype = new JobModel('Delete Set', callback);
    this.id = id;
};

/* ----- Action ----- */

DeleteJob.prototype.execute = function (callback) {
        var imageSet = this.prototype.getMetaInformationModel().getImageSetById(this.id);
        var that = this;

        // Sinlge option -> Only one image has to be processed
        this.prototype.setImagesToBeProcessedCount(1);

        // Delete images
        this.prototype.getImageManipulator().deleteImageSetImages(imageSet, function () {
            that.deleteImageSetFromModel(that.id, that.prototype.getCallbackFunction());
        });

        // Notify the job handler that this job is finished
        callback();
};

/**
 * Deletes an image set. It will be removed from the image meta information structure, the structure will be saved to file
 * and the images will be deleted.
 *
 * @param id The id of the image set.
 * @param callback Called when the complete deletion process is done. Has the updated image meta information model object as parameter.
 * **/
DeleteJob.prototype.deleteImageSetFromModel = function (id, callback) {
    // Delete information about the data set and save the information
    this.prototype.getMetaInformationModel().deleteImageSetFromModel(id);
    this.prototype.saveMetaInformation();

    // One image set was deleted -> Update job process state
    this.prototype.incrementProcessImageCounter();

    // Call callback of the job creator when stuff is done
    if(callback){
        callback(this.prototype.getMetaInformationModel());
    }
};

module.exports = DeleteJob;