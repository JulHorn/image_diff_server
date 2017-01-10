var fs = require('fs-extra');
var logger = require('winston');
var config = require('../configurationLoader');
var ImageSet = require('./ImageSetModel');
var ImageModel = require('./ImageModel');

/**
 * Constructor. Loads the meta information in the meta information text file, if it does exist.
 * **/
var ImageMetaInformationModel = function () {
    this.__initMetaInformationModel();
    this.load();
};

/* ----- Getter ----- */

/**
 * Returns the timestamp.
 *
 * @return Returns the timestamp.
 * **/
ImageMetaInformationModel.prototype.getTimeStamp = function () {
    return this.timeStamp;
};

/**
 * Returns the computed percentual difference between the reference and new image. Does not compute the value itself.
 *
 *  @return Returns the computed percentual difference between the reference and new image. Does not compute the value itself.
 * **/
ImageMetaInformationModel.prototype.getBiggestPercentualPixelDifference = function () {
    return this.biggestPercentualPixelDifference;
};

/**
 * Returns the computed hamming distance. Does not compute the value itself.
 *
 *  @return Returns the computed hamming distance. Does not compute the value itself.
 * **/
ImageMetaInformationModel.prototype.getBiggestDistanceDifference = function () {
    return this.biggestDistanceDifference;
};

/**
 * Returns the image sets.
 * @return Returns the image sets.
 * **/
ImageMetaInformationModel.prototype.getImageSets = function(){
    return this.imageSets;
};


/**
 * Returns the image set with a specific id.
 *
 * @param id The id of the image set which should be returned.
 * @return The found image set or null if none was found with the given id.
 * **/
ImageMetaInformationModel.prototype.getImageSetById = function(id){
    var result = this.getImageSets().filter(function (imageSet) {
        return imageSet.getId() === id;
    });

    // If the image does not already exist in the meta informations sturcture, then return null
    if(result.length === 0){
        return null;
    }

    // Else return the found imageSet
    return result[0];
};

/**
 * Returns the image set which contains a specific image name for its reference/new image.
 *
 * @param imageName The name of the new/reference image for which its image set should be returned.
 * @return The found image set or null if none was found with the given id.
 * **/
ImageMetaInformationModel.prototype.getImageSetByName = function(imageName){

    // If no proper name was given, return null
    if(imageName === ''){
        return null;
    }

    // Get the image set with the name
    var result = this.getImageSets().filter(function (imageSet) {
        return imageSet.getReferenceImage().getName() == imageName
            || imageSet.getNewImage().getName() == imageName;
    });

    // If the image does not already exist in the meta informations sturcture, then return null
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
 * @param timeStamp Sets the timeStamp.
 * **/
ImageMetaInformationModel.prototype.setTimeStamp = function (timeStamp) {
    this.timeStamp = timeStamp;
};

/* ----- Action Methods ----- */

/**
 * Saves meta information to file.
 * **/
ImageMetaInformationModel.prototype.save = function () {

    // Ensure that the folder structure for the meta information file exists
    logger.info('Ensuring that the meta information folder path exists:', config.getMetaInformationFolderPath());
    fs.ensureDirSync(config.getMetaInformationFolderPath());

    // Write the file
    fs.writeFile(config.getMetaInformationFilePath(), JSON.stringify(this), 'utf8', function (err) {
        if(err != null || typeof err == 'undefined'){
            logger.error('Failed to write meta information.', err);
        } else {
            logger.info('Writing meta information finished.', config.getMetaInformationFilePath());
        }
    });
};

/**
 * Loads the meta information file. If it does not exist, the program will work without meta information until some are created.
 * **/
ImageMetaInformationModel.prototype.load = function () {
    var that = this;

    // Check that file exists -> If not, then do nothing because the diff has to be calculated first
    try{
        fs.accessSync(config.getMetaInformationFilePath());
    } catch(err) {
        logger.info('Meta information file does not seem to exist. Working from a blank slate.', config.getMetaInformationFilePath());
        return;
    }

    logger.info('Loading meta information.', config.getMetaInformationFilePath());

    // Blocking file readto ensure that the complete data is loaded before further actions are taken
    var data = fs.readFileSync(config.getMetaInformationFilePath(), 'utf8');

    // Load data in object structure
    var data = JSON.parse(data);
    this.setTimeStamp(data.timeStamp);
    data.imageSets.forEach(function (imageSetData) {
        var imageSet = new ImageSet();
        imageSet.load(imageSetData);
        that.addImageSet(imageSet);
    });

    // Calculate the biggest image difference of all sets
    this.calculateBiggestDifferences();
    logger.info('Loading meta information finished.', config.getMetaInformationFilePath());
};

/**
 * Clears the content of the meta information model. The file with the meta information model will be updated.
 * **/
ImageMetaInformationModel.prototype.clear = function () {
    this.__initMetaInformationModel();
    this.save();
    logger.info('Cleared content of meta information model.');
};

/**
 * Adds an image set. If an image set with the same (reference/new) image name exists, it will be deleted before adding the new one.
 *
 * @param imageSet The image set to add.
 * **/
ImageMetaInformationModel.prototype.addImageSet = function (imageSet) {
    // Remove old/outdated image set before adding the new one with the same image names
    var oldImageSet = this.getImageSetByName(imageSet.getReferenceImage().getName());

    // Delete old image set
    if(oldImageSet === null){
        oldImageSet = this.getImageSetByName(imageSet.getNewImage().getName());

        if(oldImageSet !== null){
            this.deleteImageSet(oldImageSet.getId());
        }
    } else {
        this.deleteImageSet(oldImageSet.getId());
    }

    // Add new image set
    this.getImageSets().push(imageSet);
};

/**
 * Deletes an image set.
 *
 * @param id The id of the image set to be deleted.
 * **/
ImageMetaInformationModel.prototype.deleteImageSet = function (id) {
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
};

/* ----- Helper Methods ----- */

/**
 * Returns the index of an image set.
 *
 * @param id The id of the image set for which its index should be returned.
 * @return Returns the index of an image set. -1 If image set with that id was found.
 * **/
ImageMetaInformationModel.prototype.__getIndexOfImageSet = function (id) {
    return this.getImageSets().findIndex(function (imageSet) {
        return imageSet.getId() === id;
    });
};

/**
 * Initializes the meta information model with empty values.
 * **/
ImageMetaInformationModel.prototype.__initMetaInformationModel = function () {
    this.biggestPercentualPixelDifference = 0;
    this.biggestDistanceDifference = 0;
    this.timeStamp = '';
    this.imageSets = [];
};

module.exports = new ImageMetaInformationModel();