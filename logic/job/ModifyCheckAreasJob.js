var Job = require('./Job');
var MarkedArea = require('../model/MarkedArea');

/**
 * Job to modify the check areas of an image set.
 *
 * @param {String} id The id of the image set for which the check areas should be modified.
 * @param {MarkedArea[]} checkAreas The new ignore areas.
 * @param {Function} callback The callback method which is called, when diff process has finished. Has the this job as parameter.
 * **/
var ModifyCheckAreasJob = function (id, checkAreas, callback) {
    Job.call(this, 'ModifyCheckAreasJob', callback);
    this.id = id;
    this.checkAreas = checkAreas;
};

// Do inheritance
ModifyCheckAreasJob.prototype = Object.create(Job.prototype);

/**
 * Executes this job.
 *
 * @param {ImageMetaInformationModel} imageMetaInformationModel The image meta model in which the results will be saved.
 * @param {Function} callback The callback which will be called after the job execution is finished.
 * **/
ModifyCheckAreasJob.prototype.execute = function (imageMetaInformationModel, callback) {
    var that = this;
    that.imageMetaInformationModel = imageMetaInformationModel;
    // Single option -> Only one image has to be processed
    this.setImagesToBeProcessedCount(1);

    this.__modifyCheckAreas(this.id, this.checkAreas, function () {
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
 * @param {Object} data The object containing the information which this object should have.
 * **/
ModifyCheckAreasJob.prototype.load = function (data) {
    // Load data in the prototype
    this.loadJobData(data);

    this.id = data.id;
    this.checkAreas = data.checkAreas;
};

/**
 * Sets the ignore areas of an image set.
 *
 * @param {String} id The id of the image set for which the ignore areas should be modified.
 * @param {MarkedArea[]} checkAreas The new ignore areas.
 * @param {Function} callback The callback method which is called, when the method has finished.
 * **/
ModifyCheckAreasJob.prototype.__modifyCheckAreas = function (id, checkAreas, callback) {
    var imageSet = this.getImageMetaInformationModel().getImageSetById(id);

    // Transform general marked objects, which are received via API, to proper MarkedArea objects for function support etcö
    var transformedCheckAreas = [];

    checkAreas.forEach(function(checkArea) {
		var newCheckArea = new MarkedArea(checkArea.x, checkArea.y, checkArea.z, checkArea.height, checkArea.width);

		transformedCheckAreas.push(newCheckArea);
    });


    imageSet.setCheckAreas(transformedCheckAreas);

    // Call callback
    if(callback){
        callback();
    }
};

module.exports = ModifyCheckAreasJob;