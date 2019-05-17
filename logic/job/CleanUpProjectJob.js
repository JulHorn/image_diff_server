var Job = require('./Job');

/**
 * Job which removes all image sets from a certain project which reference image contains the image name..
 *
 * @param imageName
 * @param {String} imageName The image name contained in the reference images' name.
 * @param {String} projectId The project id from which the image sets should be deleted from.
 * @param {Function} callback The callback method which is called, when diff process has finished. Has the this job as parameter.
 * @constructor
 * **/
var CleanUpProjectJob = function (imageName, projectId, callback) {
    Job.call(this, 'CleanUpProjectJob', callback);

    this.imageName = imageName;
    this.projectId = projectId;
};

// Do inheritance
CleanUpProjectJob.prototype = Object.create(Job.prototype);

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param {ImageMetaInformationModel} imageMetaInformationModel The image meta model in which the results will be saved.
 * @param {Function} callback The callback which will be called after the job execution is finished.
 * **/
CleanUpProjectJob.prototype.execute = function (imageMetaInformationModel, callback) {
    var jobCreatorCallback = this.getCallbackFunction();
    this.imageMetaInformationModel = imageMetaInformationModel;

    this.imageMetaInformationModel.cleanUpProjectByImageName(this.imageName, this.projectId);
	this.calculateMetaInformation();

    if(jobCreatorCallback) {
        jobCreatorCallback(this);
    }

    // Notify the job handler that this job is finished
    callback();
};

/**
 * Loads the data into this job. Used to restore a previous state of this object.
 *
 * @param {Object} data The object containing the information which this object should have.
 * **/
CleanUpProjectJob.prototype.load = function (data) {
    this.imageName = data.imageName;
    this.projectId = data.projectId;

    // Load data in the prototype
    this.loadJobData(data);
};

module.exports = CleanUpProjectJob;