var Job = require('./Job');

/**
 * Job which computes the difference of two images by image names and updates the ImageMetaInformationModel accordingly.
 *
 * @param projectId
 * @param {Function} callback The callback method which is called, when diff process has finished. Has the this job as parameter.
 * @constructor
 * **/
var RemoveProjectJob = function (projectId, callback) {
    Job.call(this, 'RemoveProjectJob', callback);
    this.projectId = projectId;
};

// Do inheritance
RemoveProjectJob.prototype = Object.create(Job.prototype);

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param {ImageMetaInformationModel} imageMetaInformationModel The image meta model in which the results will be saved.
 * @param {Function} callback The callback which will be called after the job execution is finished.
 * **/
RemoveProjectJob.prototype.execute = function (imageMetaInformationModel, callback) {
    var jobCreatorCallback = this.getCallbackFunction();
    this.imageMetaInformationModel = imageMetaInformationModel;
    var wasSucessful = this.imageMetaInformationModel.deleteProject(this.projectId);

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
 * @param {Object} data The object containing the information which this object should habe.
 * **/
RemoveProjectJob.prototype.load = function (data) {
    // Load data in the prototype
    this.loadJobData(data);

};

module.exports = RemoveProjectJob;