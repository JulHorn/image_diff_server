var ImageMetaInformationModel = require('./model/ImageMetaInformationModel');
var fs = require('fs-extra');
var path = require('path');
var logger = require('winston');
var ImageManipulator = require('./ImageManipulator');
var config = require('./configurationLoader');

var ImageManipulatorRepository = function () {
    this.imageManipulator = new ImageManipulator();
};

ImageManipulatorRepository.prototype.deleteImageSet = function (id, callback) {
    var imageSet = ImageMetaInformationModel.getImageSetById(id);

    // Delete image which are part of the set
    this.__deleteFile(imageSet.getReferenceImage().getPath());
    this.__deleteFile(imageSet.getNewImage().getPath());
    this.__deleteFile(imageSet.getDiffImage().getPath());

    // Delete information about the data set and save the information
    ImageMetaInformationModel.deleteImageSet(id);
    ImageMetaInformationModel.calculateBiggestDifferences();
    ImageMetaInformationModel.setTimeStamp(new Date().toISOString());
    ImageMetaInformationModel.save();

    // Call callback when stuff is done
    callback(ImageMetaInformationModel);
};

ImageManipulatorRepository.prototype.calculateDifferencesForAllImages = function () {
    this.imageManipulator.createDiffImages(config.getAutoCropOption());
};

ImageManipulatorRepository.prototype.makeToNewReferenceImage = function (id, callback) {
    var imageSet = ImageMetaInformationModel.getImageSetById(id);
    var that = this;
    
    fs.copy(imageSet.getNewImage().getPath(), config.getReferenceImageFolderPath() + path.sep + imageSet.getNewImage().getName(), function (err) {

        if(err !== 'undefinded' || err !== null){
            // ToDo Error handling
        }

        that.imageManipulator.createDiffImage(imageSet.getNewImage().getName(), config.getAutoCropOption(), function (resultSet) {
            imageSet.setDifference(resultSet.getDifference());
            imageSet.setError(resultSet.getError());
            imageSet.setDistance(resultSet.getDistance());
            imageSet.setReferenceImage(resultSet.getReferenceImage());
            imageSet.setDiffImage(resultSet.getDiffImage());

            ImageMetaInformationModel.calculateBiggestDifferences();
            ImageMetaInformationModel.setTimeStamp(new Date().toISOString());
            ImageMetaInformationModel.save();
            callback(ImageMetaInformationModel);
        });
    });
};

ImageManipulatorRepository.prototype.__deleteFile = function (path) {
    if(this.__isFileExisting(path)){
        fs.unlink(path, function (err) {
            if(err){
                logger.error('Failed to delete file: ' + path, err);
            }
        });
    }
};

ImageManipulatorRepository.prototype.__isFileExisting = function (path) {
  try{
    fs.accessSync(path);
  } catch(err) {
      return false;
  }

  return true;
};

module.exports = new ImageManipulatorRepository();