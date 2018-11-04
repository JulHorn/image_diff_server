var logger = require('winston');
var Project = require('./ProjectModel');
var config = require('../ConfigurationLoader');

// ToDo: Use getter and make default project somewhat more global, check UUID type

/**
 * Constructor. Loads the imageMetaInformationModel information in the imageMetaInformationModel information text file, if it does exist.
 *
 * @constructor
 * **/
var ImageMetaInformationModel = function () {
    this.__init();
};

/* ----- Getter ----- */

/**
 * Returns the timestamp.
 *
 * @return {String} Returns the timestamp.
 * **/
ImageMetaInformationModel.prototype.getTimeStamp = function () {
    return this.timeStamp;
};

/**
 * Returns the computed percentual difference between the reference and new image. Does not compute the value itself.
 *
 *  @return {Number} Returns the computed percentual difference between the reference and new image. Does not compute the value itself.
 * **/
ImageMetaInformationModel.prototype.getBiggestPercentualPixelDifference = function () {
    return this.biggestPercentualPixelDifference;
};

/**
 * Returns the computed hamming distance. Does not compute the value itself.
 *
 *  @return {Number} Returns the computed hamming distance. Does not compute the value itself.
 * **/
ImageMetaInformationModel.prototype.getBiggestDistanceDifference = function () {
    return this.biggestDistanceDifference;
};

/**
 * Returns the image sets of all projects.
 *
 * @return {ImageSetModel[]} Returns the image sets.
 * **/
ImageMetaInformationModel.prototype.getImageSets = function(projectId){
    var resultImageSets = [];
    var project = this.getProject(projectId);

    if (project) {
        resultImageSets = project.getImageSets();
    } else {
        this.projects.forEach(function (currentProject) {
            resultImageSets = resultImageSets.concat(currentProject.getImageSets());
        });
    }

    return resultImageSets;
};

/**
 * Returns all projects
 *
 * @return {Array} The projects.
 */
ImageMetaInformationModel.prototype.getProjects = function() {
    return this.projects;
};

/**
 * Returns the project by the giben project id. If none was found, null will be returned.
 *
 * @param {String} projectId The project id.
 * @return {Project | null} The project by the giben project id. If none was found, null will be returned.
 */
ImageMetaInformationModel.prototype.getProject = function(projectId) {
    if (!projectId) { return null; }

    return this.projects.find(function (currentProject) {
        return currentProject.getProjectId() === projectId;
    });
};

/**
 * Returns the image set with a specific id.
 *
 * @param {String} id The id of the image set which should be returned.
 * @param {String} projectId The id of the project to which the imageSet belongs. If no id is given, the set will be searched through all projects.
 * @return {ImageSetModel|null} The found image set or null if none was found with the given id.
 * **/
ImageMetaInformationModel.prototype.getImageSetById = function(id, projectId){
    var result = this.getImageSets(projectId).filter(function (imageSet) {
            return imageSet.getId() === id;
        });

    // If the image does not already exist in the imageMetaInformationModel information structure, then return null
    if(result.length === 0){
        return null;
    }

    // Else return the found imageSet
    return result[0];
};

/**
 * Returns the image set which contains a specific image name for its reference/new image.
 *
 * @param {String} imageName The name of the new/reference image for which its image set should be returned.
 * @param {String} projectId The id of the project to which the imageSet belongs. If no id is given, the set will be searched through all projects.
 * @return {ImageSetModel|null} The found image set or null if none was found with the given id.
 * **/
ImageMetaInformationModel.prototype.getImageSetByName = function(imageName, projectId){

    // If no proper name was given, return null
    if(imageName === ''){
        return null;
    }

    // Get the image set with the name
    var result = this.getImageSets(projectId).filter(function (imageSet) {
        return imageSet.getReferenceImage().getName() === imageName
            || imageSet.getNewImage().getName() === imageName;
    });

    // If the image does not already exist in the imageMetaInformationModel information structure, then return null
    if(result.length === 0){
        return null;
    }

    // Else return the found imageSet
    return result[0];
};

/* ----- Setter ----- */

/**
 * Sets the timeStamp.
 *
 * @param {String} timeStamp Sets the timeStamp.
 * **/
ImageMetaInformationModel.prototype.setTimeStamp = function (timeStamp) {
    this.timeStamp = timeStamp;
};

/* ----- Action Methods ----- */

/**
 * Loads the imageMetaInformationModel information file. If it does not exist, the program will work without imageMetaInformationModel information until some are created.
 *
 * @param {Object} data The objects containing the data. The objects structure must be identical to this prototype.
 * **/
ImageMetaInformationModel.prototype.load = function (data) {
    var that = this;

    this.setTimeStamp(data.timeStamp);

    // Overwrite default project only if no other projects could be loaded
    if (data.projects && data.projects.length > 0) {
        data.projects.forEach(function (projectData) {
            var project = new Project();
            project.load(projectData);
            that.projects.push(project);
        });
    } else {
        this.addProject('Default', '0');
    }

    // Calculate the biggest image difference of all sets
    this.calculateBiggestDifferences();
    this.percentualPixelDifferenceThreshold = data.percentualPixelDifferenceThreshold;
    this.distanceDifferenceThreshold = data.distanceDifferenceThreshold;
};

/**
 * Calculates the biggest percentual pixel and distance difference considering all current image sets.
 * **/
ImageMetaInformationModel.prototype.calculateBiggestDifferences = function () {
    var that = this;
    var imageSets = this.getImageSets();

    // If no image set exists, the difference is always 0
    if(imageSets.length === 0){
        that.biggestPercentualPixelDifference = 0;
        that.biggestDistanceDifference = 0;
    }

    // Calculate pixel and distance difference
    imageSets.forEach(function (set) {
        if(that.biggestPercentualPixelDifference < set.getDifference()){
            that.biggestPercentualPixelDifference = set.getDifference();
        }

        if(that.biggestDistanceDifference < set.getDistance()){
            that.biggestDistanceDifference = set.getDistance();
        }
    });

    // Set thresholds here to have the current values after each refresh of the calculations
    this.percentualPixelDifferenceThreshold = config.getMaxPixelDifferenceThreshold();
    this.distanceDifferenceThreshold = config.getMaxDistanceDifferenceThreshold();
};

/**
 * Returns a new ImageMetaInformationModel object containing the data of this object as a copy.
 *
 * @return {ImageMetaInformationModel} Returns a new ImageMetaInformationModel object containing the data of this object as a copy.
 * **/
ImageMetaInformationModel.prototype.getCopy = function () {
    var copyObject = new ImageMetaInformationModel();
    copyObject.load(this);

    return copyObject;
};


/**
 * Adds an image set. If an image set with the same (reference/new) image name exists, the existing image set will be updated.
 *
 * @param {ImageSetModel} imageSetToBeAdded The image set to add.
 * @param {String} projectId The id of the project to which the imageSet will be added. If none was given or the id was not found, all projects will be searched for an existing image set with the same id and that one will be updated. Else, the image set will be added to the default project.
 * **/
ImageMetaInformationModel.prototype.addImageSet = function (imageSetToBeAdded, projectId) {
    var project = this.getProject(projectId);

    // Try to find project without project id
    if (!project) {
        project = this.getProjects().find(function (currentProject) {
            return currentProject.getImageSets().find(function (currentImageSet) {
                return imageSetToBeAdded.getId() === currentImageSet.getId();
            });
        });
    }


    //  Use given project or undeletable default project
    project = project ? project : this.getProject('0');

    project.addImageSet(imageSetToBeAdded);
};

/**
 * Deletes an image set.
 *
 * @param {String} id The id of the image set to be deleted.
 * @param {String} projectId The id of the project of which the imageSet will be removed. If none was given or the id was not found, all projects will be searched for an existing image set and that one will be removed.
 * **/
ImageMetaInformationModel.prototype.deleteImageSetFromModel = function (id, projectId) {
    var project = this.getProject(projectId);

    if (!project) {
        project = this.projects.find(function (currentProject) {
            return currentProject.getImageSets().find(function (currentImageSet) {
                return currentImageSet.getId() === id
            });
        });
    }

    var index = this.__getIndexOfImageSetInProject(id, project);

    // Error handling
    if(index < 0){
        var error = 'The image set with the id '
            + id
            + ' does not exist and thus can not be deleted.';

        logger.error(error);
        throw Error(error);
    }

    project.getImageSets().splice(index, 1);
};

/**
 * Adds a new project to the ImageMetaInformationModel.
 *
 * @param {String} projectName The name of the new project.
 * @param {String} projectId The id of the new project. Must be unique.
 * @return {ProjectModel} The newly created project.
 */
ImageMetaInformationModel.prototype.addProject = function(projectName, projectId) {
    var project = new Project(projectName, projectId);

    this.projects.push(project);

    return project;
};

/**
 * Renames an existing project of the ImageMetaInformationModel.
 *
 * @param {String} newProjectName The new project name.
 * @param {String} projectId The id of the project of which the name should be changed.
 * @return {boolean} True if the renaming was successful, else false.
 */
ImageMetaInformationModel.prototype.renameProject = function(newProjectName, projectId) {
    var project = this.getProject(projectId);

    if (!project) { return false; }

    project.setProjectName(newProjectName);

    return true;
};

/**
 * Deletes an existing project of the ImageMetaInformationModel.
 *
 * @param projectId The id of the project to be deleted.
 * @return {boolean} True if the deletion was successful, else false.
 */
ImageMetaInformationModel.prototype.deleteProject = function(projectId) {
    if (!projectId || projectId === '0') {
        logger.warn('Tried to delete default project or no project id given. Canceled. Given project id: ' + projectId);
        return false;
    }

    this.projects = this.projects.filter(function (currentProject) {
        return currentProject.getProjectId() !== projectId;
    });

    return true;
};

/**
 * ToDo Error Handling
 *
 * Re-assigns an image set to another project.
 *
 * @param {String} imageSetId The image set which should be assigned to another project.
 * @param {String} projectIdFrom The project to which the image set currently belongs.
 * @param {String} projectIdTo The project to which the image set should be assigned to.
 * @return {boolean} True if the assignment was a success, else false.
 */
ImageMetaInformationModel.prototype.assignImageSetToProject = function(imageSetId, projectIdFrom, projectIdTo) {
    var imageSetToBeMoved = this.getImageSetById(imageSetId, projectIdFrom);
    this.addImageSet(imageSetToBeMoved, projectIdTo);
    this.deleteImageSetFromModel(imageSetId, projectIdFrom);

    return true;
};

/* ----- Helper Methods ----- */

/**
 * Returns the index of the imageSet by the given id.
 *
 * @param {String} id The id of the image set for which its index should be returned.
 * @param project
 * @return {Number} Returns the index of the image set or -1.
 * **/
ImageMetaInformationModel.prototype.__getIndexOfImageSetInProject = function (id, project) {
    // Use this method instead of the array method for downward compatibility
    var imageSetIndex = -1;

    if (!project) { return -1; }

    project.getImageSets().forEach(function (imageSet, index) {
        if(imageSet.getId() === id) {
            imageSetIndex = index;

            return false;
        }
    });

    return imageSetIndex;
};

/**
 * Checks whether two image names are identical and not empty.
 *
 * @param {Image} image1 The first image.
 * @param {Image} image2 The second image.
 * @return {Boolean} True if they are the same, else false.
 * **/
ImageMetaInformationModel.prototype.__isImageNameTheSame = function (image1, image2) {
    return image1.getName() === image2.getName()
        && image1.getName() !== '';
};


/**
 * Resets the imageMetaInformationModel information model to its initial state.
 * **/
ImageMetaInformationModel.prototype.__init = function () {
    this.biggestPercentualPixelDifference = 0;
    this.biggestDistanceDifference = 0;
    this.percentualPixelDifferenceThreshold = 0;
    this.distanceDifferenceThreshold = 0;
    this.timeStamp = '';
    this.projects = [];
};

module.exports = ImageMetaInformationModel;
