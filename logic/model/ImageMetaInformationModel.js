var logger = require('winston');
var ImageSet = require('./ImageSetModel');
var config = require('../ConfigurationLoader');

/**
 * Constructor. Loads the imageMetaInformationModel information in the imageMetaInformationModel information text file, if it does exist.
 *
 * @constructor
 * **/
var ImageMetaInformationModel = function () {
    this.reset();
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
 * Returns the image sets.
 * @return {ImageSetModel[]} Returns the image sets.
 * **/
ImageMetaInformationModel.prototype.getImageSets = function(){
    return this.imageSets;
};

/**
 * Returns the image set with a specific id.
 *
 * @param {String} id The id of the image set which should be returned.
 * @return {ImageSetModel|null} The found image set or null if none was found with the given id.
 * **/
ImageMetaInformationModel.prototype.getImageSetById = function(id){
    var result = this.getImageSets().filter(function (imageSet) {
        return imageSet.getId() === id;
    });

    // If the image does not already exist in the imageMetaInformationModel information sturcture, then return null
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
 * @return {ImageSetModel|null} The found image set or null if none was found with the given id.
 * **/
ImageMetaInformationModel.prototype.getImageSetByName = function(imageName){

    // If no proper name was given, return null
    if(imageName === ''){
        return null;
    }

    // Get the image set with the name
    var result = this.getImageSets().filter(function (imageSet) {
        return imageSet.getReferenceImage().getName() === imageName
            || imageSet.getNewImage().getName() === imageName;
    });

    // If the image does not already exist in the imageMetaInformationModel informations sturcture, then return null
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

    data.imageSets.forEach(function (imageSetData) {
        var imageSet = new ImageSet();
        imageSet.load(imageSetData);
        that.addImageSet(imageSet);
    });

    // Calculate the biggest image difference of all sets
    this.calculateBiggestDifferences();
    this.percentualPixelDifferenceThreshold = data.percentualPixelDifferenceThreshold;
    this.distanceDifferenceThreshold = data.distanceDifferenceThreshold;
};

/**
 * Adds an image set. If an image set with the same (reference/new) image name exists, the existing image set will be updated.
 *
 * @param {ImageSetModel} imageSetToBeAdded The image set to add.
 * **/
ImageMetaInformationModel.prototype.addImageSet = function (imageSetToBeAdded) {
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
    }
};

/**
 * Removes the image sets whose image differences do not breach a threshold.
 * **/
ImageMetaInformationModel.prototype.cleanUp = function () {
    var that = this;

    // Get obsolete (image sets in the green range) image set
    // and images which do not have a ignore area so the image sets with ignore areas will not be deleted
    var obsoleteImageSets = this.getImageSets().filter(function (imageSet) {
        return imageSet.getDistance() <= config.getMaxDistanceDifferenceThreshold()
            && imageSet.getDifference() <= config.getMaxPixelDifferenceThreshold()
            && imageSet.getIgnoreAreas().length === 0;
    });

    // Remove them from the meta information model
    obsoleteImageSets.forEach(function (imageSet) {
        that.deleteImageSetFromModel(imageSet.getId());
    });
};

/**
 * Deletes an image set.
 *
 * @param {String} id The id of the image set to be deleted.
 * **/
ImageMetaInformationModel.prototype.deleteImageSetFromModel = function (id) {
    var index = this.__getIndexOfImageSet(id);

    // Error handling
    if(index < 0){
        var error = 'The image set with the id '
            + id
            + ' does not exist and thus can not be deleted.';

        logger.error(error);
        throw Error(error);
    }

    this.getImageSets().splice(index, 1);
};

/**
 * Calculates the biggest percentual pixel and distance difference considering all current image sets.
 * **/
ImageMetaInformationModel.prototype.calculateBiggestDifferences = function () {
    var that = this;

    // If no image set exists, the difference is always 0
    if(this.getImageSets().length === 0){
        that.biggestPercentualPixelDifference = 0;
        that.biggestDistanceDifference = 0;
    }

    // Calculate pixel and distance difference
    this.getImageSets().forEach(function (set) {
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
 * Resets the imageMetaInformationModel information model to its initial state.
 * **/
ImageMetaInformationModel.prototype.reset = function () {
    this.biggestPercentualPixelDifference = 0;
    this.biggestDistanceDifference = 0;
    this.percentualPixelDifferenceThreshold = 0;
    this.distanceDifferenceThreshold = 0;
    this.timeStamp = '';
    this.imageSets = [];
};

/* ----- Helper Methods ----- */

/**
 * Returns the index of the imageSet by the given id.
 *
 * @param {String} id The id of the image set for which its index should be returned.
 * @return {Number} Returns the index of the image set or -1.
 * **/
ImageMetaInformationModel.prototype.__getIndexOfImageSet = function (id) {
    // Use this method instead of the array method for downward compatibility
    var imageSetIndex = -1;

    this.getImageSets().forEach(function (imageSet, index) {
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

module.exports = ImageMetaInformationModel;
