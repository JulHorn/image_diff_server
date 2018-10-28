var Job = require('./Job');

/**
 * Job which computes the difference of two images by image names and updates the ImageMetaInformationModel accordingly.
 *
 * @param projectName ToDo
 * @param {Function} callback The callback method which is called, when diff process has finished. Has the this job as parameter.
 * @constructor
 * **/
var AddProjectJob = function (projectName, callback) {
    Job.call(this, 'AddProjectJob', callback);
    this.projectName = projectName;
};

// Do inheritance
AddProjectJob.prototype = Object.create(Job.prototype);

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param {ImageMetaInformationModel} imageMetaInformationModel The image meta model in which the results will be saved.
 * @param {Function} callback The callback which will be called after the job execution is finished.
 * **/
AddProjectJob.prototype.execute = function (imageMetaInformationModel, callback) {
    var jobCreatorCallback = this.getCallbackFunction();

    this.imageMetaInformationModel = imageMetaInformationModel;

    var resultProject = this.imageMetaInformationModel.addProject(this.projectName);

    if(jobCreatorCallback) {
        jobCreatorCallback(resultProject);
    }

    // Notify the job handler that this job is finished
    callback();
};

/**
 * Loads the data into this job. Used to restore a previous state of this object.
 *
 * @param {Object} data The object containing the information which this object should habe.
 * **/
AddProjectJob.prototype.load = function (data) {
    // Load data in the prototype
    this.loadJobData(data);
};

module.exports = AddProjectJob;