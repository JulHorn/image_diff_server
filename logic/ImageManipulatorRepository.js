var ImageMetaInformationModel = require('./model/ImageMetaInformationModel');
var fs = require('fs-extra');
var logger = require('winston');

var ImageManipulatorRepository = function () {
    
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

ImageManipulatorRepository.prototype.update = function () {
    
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