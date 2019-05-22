var Job = require('./Job');
MarkedArea = require('../model/MarkedArea');
var config = require('../ConfigurationLoader');

/**
 * Job to modify the ignore areas of an image set.
 *
 * @param {String} id The id of the image set for which the ignore areas should be modified.
 * @param {MarkedArea[]} ignoreAreas The new ignore areas.
 * @param {Function} callback The callback method which is called, when diff process has finished. Has the this job as parameter.
 * **/
var ModifyIgnoreAreasJob = function (id, ignoreAreas, callback) {
    Job.call(this, 'ModifyIgnoreAreasJob', callback);
    this.id = id;
    this.ignoreAreas = ignoreAreas;
};

// Do inheritance
ModifyIgnoreAreasJob.prototype = Object.create(Job.prototype);

/**
 * Executes this job.
 *
 * @param {ImageMetaInformationModel} imageMetaInformationModel The image meta model in which the results will be saved.
 * @param {Function} callback The callback which will be called after the job execution is finished.
 * **/
ModifyIgnoreAreasJob.prototype.execute = function (imageMetaInformationModel, callback) {
    var that = this;
    that.imageMetaInformationModel = imageMetaInformationModel;
    // Single option -> Only one image has to be processed
    this.setImagesToBeProcessedCount(1);

    this.__modifyIgnoreAreas(this.id, this.ignoreAreas, function (resultSet) {
        var jobCreatorCallback = that.getCallbackFunction();
        // Update the processed image count
        that.incrementProcessImageCounter();

        // Make the reference of the model to a copy to have a snapshot which will not be changed anymore
        that.copyImageMetaInformationModel();

        /// Call callback of the job creator when stuff is done
        if (jobCreatorCallback) {
            jobCreatorCallback(that, resultSet);
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
ModifyIgnoreAreasJob.prototype.load = function (data) {
    // Load data in the prototype
    this.loadJobData(data);

    this.id = data.id;
    this.ignoreAreas = data.ignoreAreas;
};

/**
 * Sets the ignore areas of an image set.
 *
 * @param {String} id The id of the image set for which the ignore areas should be modified.
 * @param {MarkedArea[]} ignoreAreas The new ignore areas.
 * @param {Function} callback The callback method which is called, when the method has finished.
 * **/
ModifyIgnoreAreasJob.prototype.__modifyIgnoreAreas = function (id, ignoreAreas, callback) {
    var imageSet = this.getImageMetaInformationModel().getImageSetById(id);
    var that = this;

	// Transform general marked objects, which are received via API, to proper MarkedArea objects for function support etcö
	var transformedIgnoreAreas = [];

	ignoreAreas.forEach(function(ignoreArea) {
		var newIgnoreArea = new MarkedArea(ignoreArea.x, ignoreArea.y, ignoreArea.z, ignoreArea.height, ignoreArea.width);

		transformedIgnoreAreas.push(newIgnoreArea);
	});

    imageSet.setIgnoreAreas(transformedIgnoreAreas);

	// Compare again after setting marked areas to get the up to date version
	that.getImageManipulator().createDiffImage(imageSet.getNewImage().getName(), config.getAutoCropOption(), imageSet.getIgnoreAreas(), imageSet.getCheckAreas(), function (resultSet) {
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
};

module.exports = ModifyIgnoreAreasJob;