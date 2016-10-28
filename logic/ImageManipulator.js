var jimp = require('jimp');
var fs = require('fs-extra');
var path = require('path');
var config = require('./configurationLoader');
var ImageSetModel = require('./model/ImageSetModel');
var logger = require('winston');

var ImageManipulator = function () {
    
};

ImageManipulator.prototype.createDiffImage = function (imageName, autoCrop, callback) {

    // Other vars
    var that = this;

    // Assign default value value is falsey
    autoCrop = autoCrop || false;

    // Get images
    var referenceImagePath = config.getReferenceImageFolderPath() + path.sep + imageName;
    var newImagePath = config.getNewImageFolderPath() + path.sep + imageName;
    var diffImagePath = config.getResultImageFolderPath() + path.sep + imageName;
    logger.info('Reference image:', referenceImagePath);
    logger.info('New image path:', newImagePath);
    logger.info('Diff image path:', diffImagePath);

    // If one of the images do not exist, then quit
    if(!this.__checkImageExists(referenceImagePath) || !this.__checkImageExists(newImagePath)){
        var errorText = 'Reference or new image does not exist:'
            + referenceImagePath
            + "\n"
            +  newImagePath;

        logger.error(errorText);
        throw Error(errorText);
    }

    // Compute differences
    jimp.read(referenceImagePath, function (err, referenceImage) {
        jimp.read(newImagePath, function (err, newImage) {

            // If the image size is not identical and autocrop is off
            if((referenceImage.bitmap.height !== newImage.bitmap.height
                || referenceImage.bitmap.width !== newImage.bitmap.width) && !autoCrop){
                var errorText = 'Image dimesions are not equal: '
                    + 'reference: ' + referenceImage.bitmap.height + '/' + referenceImage.bitmap.width
                    + 'reference: ' + referenceImage.bitmap.height + '/' + referenceImage.bitmap.width;
                logger.error(errorText);
                throw Error(errorText);
            }

            // Autocrop if argument is given to normalalize images
            that.__autoCrop(referenceImage, newImage, autoCrop);

            // Create diff and write file
            var diff = jimp.diff(referenceImage, newImage);
            diff.image.write(diffImagePath);

            // Create data structure for the gathering of meta informations
            callback(that.__createImageSet(imageName, referenceImage, newImagePath, diff.image, diff.percent, jimp.distance(referenceImage, newImage), ''));
        });
    });
};

ImageManipulator.prototype.createDiffImages = function () {

};

ImageManipulator.prototype.__autoCrop = function (image1, image2, autoCrop) {
    if(autoCrop){
        image1.autocrop();
        image2.autocrop();
    }
};

ImageManipulator.prototype.__checkImageExists = function (imagePath) {
    return fs.statSync(imagePath).isFile();
};

ImageManipulator.prototype.__createImageSet = function(imageName, referenceImage, newImage, diffImage, difference, distance, error){
    var imageSet = new ImageSetModel();

    imageSet.setDifference(difference);
    imageSet.setDistance(distance);
    imageSet.setError(error);

    imageSet.getReferenceImage().setName(imageName);
    imageSet.getReferenceImage().setHeight(referenceImage.bitmap.height);
    imageSet.getReferenceImage().setWidth(referenceImage.bitmap.width);

    imageSet.getNewImage().setName(imageName);
    imageSet.getNewImage().setHeight(referenceImage.bitmap.height);
    imageSet.getNewImage().setWidth(referenceImage.bitmap.width);

    imageSet.getDiffImage().setName(imageName);
    imageSet.getDiffImage().setHeight(referenceImage.bitmap.height);
    imageSet.getDiffImage().setWidth(referenceImage.bitmap.width);

    return imageSet;
};

module.exports = ImageManipulator;