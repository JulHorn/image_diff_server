var fs = require('fs-extra');
var logger = require('winston');
var config = require('../configurationLoader');
var ImageSet = require('./ImageSetModel');
var ImageModel = require('./ImageModel');

var ImageMetaInformationModel = function () {
    this.biggestPercentualPixelDifference = 0;
    this.biggestDistanceDifference = 0;
    this.timeStamp = '';
    this.imageSets = [];
    this.load();
};

ImageMetaInformationModel.prototype.setTimeStamp = function (timestamp) {
    this.timeStamp = timestamp;
};

ImageMetaInformationModel.prototype.getTimeStamp = function () {
    return this.timeStamp;
};

ImageMetaInformationModel.prototype.getBiggestPercentualPixelDifference = function () {
    return this.biggestPercentualPixelDifference;
};

ImageMetaInformationModel.prototype.getBiggestDistanceDifference = function () {
    return this.biggestDistanceDifference;
};

ImageMetaInformationModel.prototype.save = function () {
    fs.writeFile(config.getMetaInformationFilePath(), JSON.stringify(this), 'utf8', function (err) {
        if(err != null || typeof err == 'undefined'){
            logger.error('Failed to write meta information.', err);
        }

        logger.info('Writing meta information finished.');
    });
};

ImageMetaInformationModel.prototype.load = function () {
    // Check that file exists -> If not, then do nothing because the diff has to be calculated first
    try{
        fs.accessSync(config.getMetaInformationFilePath());
    } catch(err) {
        return;
    }

    // Blocking to ensure that the complete data is loaded before further actions are taken
    var data = fs.readFileSync(config.getMetaInformationFilePath(), 'utf8');
    var data = JSON.parse(data);
    var that = this;

    this.setTimeStamp(data.timeStamp);
    data.imageSets.forEach(function (imageSetData) {
        var imageSet = new ImageSet();
        imageSet.load(imageSetData);
        that.addImageSet(imageSet);
    });

    this.calculateBiggestDifferences();

    logger.info('Loading meta information finished.');
};

ImageMetaInformationModel.prototype.getImageSets = function(){
    return this.imageSets;
};

ImageMetaInformationModel.prototype.addImageSet = function (imageSet) {
    // Remove old/outdated image set before adding the new one with the same image names
    var oldImageSet = this.getImageSetByName(imageSet.getReferenceImage().getName());

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
}

ImageMetaInformationModel.prototype.calculateBiggestDifferences = function () {
var that = this;

    this.getImageSets().forEach(function (set) {
        if(that.biggestPercentualPixelDifference < set.getDifference()){
            that.biggestPercentualPixelDifference = set.getDifference();
        }

        if(that.biggestDistanceDifference < set.getDistance()){
            that.biggestDistanceDifference = set.getDistance();
        }
    });
};

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

ImageMetaInformationModel.prototype.__getIndexOfImageSet = function (id) {
    return this.getImageSets().findIndex(function (imageSet) {
        return imageSet.getId() === id;
    });
};

module.exports = new ImageMetaInformationModel();