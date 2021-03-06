var Job = require('./Job');

/**
 * Job which computes the difference of two images by image names and updates the ImageMetaInformationModel accordingly.
 *
 * @param projectId
 * @param newProjectName
 * @param {Function} callback The callback method which is called, when diff process has finished. Has the this job as parameter.
 * @constructor
 * **/
var EditProjectJob = function (projectId, newProjectName, callback) {
    Job.call(this, 'EditProjectJob', callback);
    this.projectId = projectId;
    this.newProjectName = newProjectName;
};

// Do inheritance
EditProjectJob.prototype = Object.create(Job.prototype);

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param {ImageMetaInformationModel} imageMetaInformationModel The image meta model in which the results will be saved.
 * @param {Function} callback The callback which will be called after the job execution is finished.
 * **/
EditProjectJob.prototype.execute = function (imageMetaInformationModel, callback) {
    var jobCreatorCallback = this.getCallbackFunction();
    this.imageMetaInformationModel = imageMetaInformationModel;
    var wasSucessful = this.imageMetaInformationModel.renameProject(this.newProjectName, this.projectId);

    this.setImagesToBeProcessedCount(1);
    this.incrementProcessImageCounter();

    if(jobCreatorCallback) {
        jobCreatorCallback(this, wasSucessful);
    }
    // Notify the job handler that this job is finished
    callback();
};

/**
 * Loads the data into this job. Used to restore a previous state of this object.
 *
 * @param {Object} data The object containing the information which this object should have.
 * **/
EditProjectJob.prototype.load = function (data) {
    this.projectId = data.projectId;
    this.newProjectName = data.newProjectName;

    // Load data in the prototype
    this.loadJobData(data);
};

module.exports = EditProjectJob;