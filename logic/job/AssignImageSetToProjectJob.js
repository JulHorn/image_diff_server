var Job = require('./Job');

/**
 * Job which computes the difference of two images by image names and updates the ImageMetaInformationModel accordingly.
 *
 * @param {String} imageSetId The id of the image set that should be assigned to a new project.
 * @param {String} projectIdFrom The id of the source project. If no id is given, the set will be searched through all projects.
 * @param {String} projectIdTo The project the image set should be assigned to.
 * @param {Function} callback The callback method which is called, when diff process has finished. Has the this job as parameter.
 * @constructor
 * **/
var AssignImageSetToProjectJob = function (imageSetId, projectIdFrom, projectIdTo, callback) {
    Job.call(this, 'AssignImageSetToProjectJob', callback);
    this.imageSetId = imageSetId;
    this.projectIdFrom = projectIdFrom;
    this.projectIdTo = projectIdTo;
};

// Do inheritance
AssignImageSetToProjectJob.prototype = Object.create(Job.prototype);

/* ----- Action ----- */

/**
 * Executes this job.
 *
 * @param {ImageMetaInformationModel} imageMetaInformationModel The image meta model in which the results will be saved.
 * @param {Function} callback The callback which will be called after the job execution is finished.
 * **/
AssignImageSetToProjectJob.prototype.execute = function (imageMetaInformationModel, callback) {
    var jobCreatorCallback = this.getCallbackFunction();
// ToDo Add progress counter and to other jobs too
    this.imageMetaInformationModel = imageMetaInformationModel;

    var wasSuccessful = this.imageMetaInformationModel.assignImageSetToProject(this.imageSetId, this.projectIdFrom, this.projectIdTo);

    if(jobCreatorCallback) {
        jobCreatorCallback(this, wasSuccessful);
    }

    // Notify the job handler that this job is finished
    callback();
};

/**
 * ToDo: Check all load methods of new Jobs
 * Loads the data into this job. Used to restore a previous state of this object.
 *
 * @param {Object} data The object containing the information which this object should habe.
 * **/
AssignImageSetToProjectJob.prototype.load = function (data) {
    // Load data in the prototype
    this.loadJobData(data);
};

module.exports = AssignImageSetToProjectJob;