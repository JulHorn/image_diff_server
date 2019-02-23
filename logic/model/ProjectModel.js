var uuid = require('uuid/v4');
var ImageSet = require('./ImageSetModel');

/**
 * Constructor.
 *
 * @param projectName Name of the project.
 * @param projectId Id of the project. If none was given, a UID will be created.
 * @constructor
 */
var ProjectModel = function (projectName, projectId) {
    this.name = projectName ? projectName : 'Name me';
    this.id = projectId ? projectId : uuid();
    this.imageSets = [];
    this.failedCount = 0;
    this.passedCount = 0;
    this.totalCount = 0;
};

/* ----- Getter ----- */

/**
 * Returns the project name
 *
 * @return {String} Returns the project name.
 * **/
ProjectModel.prototype.getProjectName = function () {
    return this.name;
};

/**
 * Returns the project id.
 *
 * @return {String} Returns the project id.
 * **/
ProjectModel.prototype.getProjectId = function () {
    return this.id;
};

/**
 * Returns the image sets.
 * @return {ImageSetModel[]} Returns the image sets.
 * **/
ProjectModel.prototype.getImageSets = function(){
    return this.imageSets;
};

/**
 * Returns the number of image sets in this project which break the threshold.
 *
 * @return {number} The number of image sets in this project which break the threshold.
 */
ProjectModel.prototype.getFailedCount = function () {
  return this.failedCount;
};

/**
 * Returns the number of image sets in this project which don't  break the threshold.
 *
 * @return {number} The number of image sets in this project which don't break the threshold.
 */
ProjectModel.prototype.getPassedCount = function () {
    return this.passedCount;
};

/**
 * Returns the number of all image sets in this project.
 *
 * @return {number} The number of all image sets in this project.
 */
ProjectModel.prototype.getTotalCount = function () {
    return this.totalCount;
};

/* ----- Setter ----- */

/**
 * Sets the project name.
 *
 * @param {String} projectName Sets the project name.
 * **/
ProjectModel.prototype.setProjectName = function (projectName) {
    this.name = projectName;
};

/**
 * Sets the image project id
 *
 * @param {String} projectId Sets the image project id.
 * **/
ProjectModel.prototype.setProjectId = function (projectId) {
    this.id = projectId;
};

/* ----- Action Methods ----- */

/**
 * Loads the given data with a project structure into this project.
 *
 * @param {Object} data The objects containing the data. The objects structure must be identical to this prototype.
 * **/
ProjectModel.prototype.load = function (data) {
    var that = this;

    this.id = data.id;
    this.name = data.name;

    // Add image sets
    data.imageSets.forEach(function (imageSetData) {
        var imageSet = new ImageSet();

        imageSet.load(imageSetData);
        that.addImageSet(imageSet);
    });
};

/**
 * Adds an image set. If an image set with the same (reference/new) image name exists, the existing image set will be updated.
 *
 * @param {ImageSetModel} imageSetToBeAdded The image set to add.
 * **/
ProjectModel.prototype.addImageSet = function (imageSetToBeAdded) {
    var that = this;

    // Get existing image set by image name (is unique), if there exists one
    // ToDo: Find a way to improve the performance
    var resultSet = this.getImageSets().filter(function (currentImageSet) {
        return that.__isImageNameTheSame(currentImageSet.getReferenceImage(), imageSetToBeAdded.getReferenceImage())
            || that.__isImageNameTheSame(currentImageSet.getNewImage(), imageSetToBeAdded.getNewImage());
    });

    // Update existing set or add a new one
    // Use a better way than mapping values like that
    if(resultSet.length > 0) {
        resultSet[0].setReferenceImage(imageSetToBeAdded.getReferenceImage());
        resultSet[0].setNewImage(imageSetToBeAdded.getNewImage());
        resultSet[0].setDiffImage(imageSetToBeAdded.getDiffImage());
        resultSet[0].setError(imageSetToBeAdded.getError());
        resultSet[0].setDifference(imageSetToBeAdded.getDifference());
        resultSet[0].setDistance(imageSetToBeAdded.getDistance());
        // No clue why the getter/setter functions are not available here, grml
        resultSet[0].isThresholdBreached = imageSetToBeAdded.isThresholdBreached;
    } else {
        // Add new image set
        this.getImageSets().push(imageSetToBeAdded);

        // Update image set counts
        imageSetToBeAdded.getThresholdBreachedState() ? this.failedCount++ : this.passedCount++;
        this.totalCount++;
    }
};

/**
 * Removes an image set from this project.
 *
 * @param imageSetId The image set to be removed.
 * @return True if there was an image set removed, else false.
 */
ProjectModel.prototype.removeImageSet = function (imageSetId) {
    var imageSetToBeDeletedIndex = -1;

    var imageSetToBeDeleted = this.getImageSets().find(function (imageSet, index) {
        if (imageSet.getId() === imageSetId) {
            imageSetToBeDeletedIndex = index;
            return true;
        }

      return false;
  });

  if (imageSetToBeDeletedIndex >= 0) {
      this.getImageSets().splice(imageSetToBeDeletedIndex, 1);

      // Update image set counts
      imageSetToBeDeleted.getThresholdBreachedState() ? this.failedCount-- : this.passedCount--;
      this.totalCount--;

      return true;
  }

  return false;
};

/* ----- Helper Methods ----- */

/**
 * Checks whether two image names are identical and not empty.
 *
 * @param {Image} image1 The first image.
 * @param {Image} image2 The second image.
 * @return {Boolean} True if they are the same, else false.
 * **/
ProjectModel.prototype.__isImageNameTheSame = function (image1, image2) {
    return image1.getName() === image2.getName()
        && image1.getName() !== '';
};


module.exports = ProjectModel;