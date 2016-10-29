var fs = require('fs-extra');
var logger = require('winston');
var config = require('../configurationLoader');
var ImageSet = require('./ImageSetModel');

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
            logger.error('Failed to write meta informations.', err);
        }

        logger.info('Writing meta informations finished.');
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

    logger.info('Loading meta informations finished.');
};

ImageMetaInformationModel.prototype.getImageSets = function(){
    return this.imageSets;
};

ImageMetaInformationModel.prototype.addImageSet = function (imageSet) {
    this.imageSets.push(imageSet);
};

ImageMetaInformationModel.prototype.addImageSets = function (imageSets) {
    this.imageSets = this.imageSets.concat(imageSets);
};

ImageMetaInformationModel.prototype.calculateBiggestDifferences = function () {
var that = this;

    this.imageSets.forEach(function (set) {
        if(that.biggestPercentualPixelDifference < set.getDifference()){
            that.biggestPercentualPixelDifference = set.getDifference();
        }

        if(that.biggestDistanceDifference < set.getDistance()){
            that.biggestDistanceDifference = set.getDistance();
        }
    });
};

ImageMetaInformationModel.prototype.getImageSetById = function(id){

};

ImageMetaInformationModel.prototype.getImageSetByName = function(id){

};

module.exports = new ImageMetaInformationModel();