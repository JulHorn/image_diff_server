var ImageSetModel = require('./model/ImageSetModel');
var jimp = require('jimp');
var fs = require('fs-extra');
var path = require('path');
var config = require('./ConfigurationLoader');
var logger = require('winston');

/**
 * Constructor.
 *
 * @Constructor
 * **/
var ImageManipulator = function () {};

/* ----- Create Methods ----- */

/**
 * Creates a diff image of the reference and new image and saves it to the, in the config file configured, folder path.
 * Does not update the imageMetaInformationModel information itself.
 *
 * @param {String} imageName The name of the images that should be compared. The image must have the same name in the reference and new folder. The diff image will have the name, too.
 * @param {Boolean} autoCrop Determines if the new/reference images should be auto croped before comparison to yield better results if the sometimes differ in size. Must be a boolean.
 * @param {IgnoreArea[]} ignoreAreas The areas which will not be part of the comparison.
 * @param {Function} callback The callback function which is called, when the method has finished the comparison. The callback has an imageSet as job.
 * **/
ImageManipulator.prototype.createDiffImage = function (imageName, autoCrop, ignoreAreas, callback) {
    // Other vars
    var that = this;
    // Stores the error text if an error occurred
    var error = '';

    // Assign default value, if no value was given
    autoCrop = autoCrop || false;

    // Get images
    var referenceImagePath = config.getReferenceImageFolderPath() + path.sep + imageName;
    var newImagePath = config.getNewImageFolderPath() + path.sep + imageName;
    var diffImagePath = config.getResultImageFolderPath() + path.sep + imageName;
    logger.info('Creating diff image for:', imageName);

    // If one of the images does not exist, then quit
    if(!this.__isImageExisting(referenceImagePath) || !this.__isImageExisting(newImagePath)){
        var errorText = 'Reference or new image does not exist:\n'
            + 'Reference: ' + referenceImagePath
            + "\n"
            +  'New: ' + newImagePath;

        logger.error(errorText);
        error = errorText;
    }

    // Compute differences
    this.loadImage(referenceImagePath, function (err, referenceImage) {
        that.loadImage(newImagePath, function (err, newImage) {

            // If the image size is not identical
            if((referenceImage.bitmap.height !== newImage.bitmap.height
                || referenceImage.bitmap.width !== newImage.bitmap.width) && !autoCrop){
                var errorText = 'Image dimensions are not equal: '
                    + 'new: ' + newImage.bitmap.height + '/' + newImage.bitmap.width
                    + '\nreference: ' + referenceImage.bitmap.height + '/' + referenceImage.bitmap.width;
                logger.error(errorText);
            }

            // Autocrop if argument is given to normalalize images
            that.__autoCrop(referenceImage, newImage, autoCrop);

            // Add ignore areas, which should not be part of the comparison
            that.__setIgnoreAreas(referenceImage, newImage, ignoreAreas);

            // Create diff, ensure that folder structure exists and write file
            var diff = jimp.diff(referenceImage, newImage);
            fs.ensureDirSync(config.getResultImageFolderPath());
            diff.image.write(diffImagePath, function () {
                // Create data structure for the gathering of imageMetaInformationModel information (distance and difference are between 0 and 0 -> * 100 for percent)
                callback(that.createCompleteImageSet(imageName, referenceImage, newImage, diff.image, diff.percent * 100, jimp.distance(referenceImage, newImage) * 100, ''));

            });
        });
    });
};

/**
 * Deletes images of an image set.
 *
 * @param imageSet The image set from which the images should be deleted.
 * @param callback Called when the complete deletion process is done. Has the updated image imageMetaInformationModel information model object as job.
 * **/
ImageManipulator.prototype.deleteImageSetImages = function (imageSet, callback) {

    // Delete image which are part of the set
    this.__deleteFile(imageSet.getReferenceImage().getPath());
    this.__deleteFile(imageSet.getNewImage().getPath());
    this.__deleteFile(imageSet.getDiffImage().getPath());

    // Call callback when stuff is done
    if(callback){
        callback();
    }
};

/**
 * Loads an image via jimp.
 *
 * @param imagePath The complete path to the image file.
 * @param callback Called when the image was loaded. Returns the image as jimp object and an error object.
 * **/
ImageManipulator.prototype.loadImage = function (imagePath, callback) {
    jimp.read(imagePath, function (err, newImage) {
        callback(err, newImage);
    });
};

/* ----- Creation Helper Methods ----- */

/**
 * Creates an image set for one image only (there exists only a reference or new image).
 *
 * @param imageName The name of the image.
 * @param image The jimp loaded image.
 * @param error The error. E.g. something like: 'There exists no base image for this new image yet'.
 * @param isReferenceImage Determines whether the given information is for a reference or new image. Boolean expected.
 *
 * @return The constructed image set containing the information.
 * **/
ImageManipulator.prototype.createSingleImageSet = function (imageName, image, error, isReferenceImage) {
    var imageSet = new ImageSetModel();

    // Set error values
    imageSet.setError(error);
    imageSet.setDifference(100);
    imageSet.setDistance(100);

    // Edit set dependant of the image type
    if(isReferenceImage) {
        var referenceImage = imageSet.getReferenceImage();

        referenceImage.setHeight(image.bitmap.height);
        referenceImage.setWidth(image.bitmap.width);
        referenceImage.setName(imageName);
        referenceImage.setPath(config.getReferenceImageFolderPath() + path.sep + imageName);
    } else {
        var newImage = imageSet.getNewImage();

        newImage.setHeight(image.bitmap.height);
        newImage.setWidth(image.bitmap.width);
        newImage.setName(imageName);
        newImage.setPath(config.getNewImageFolderPath() + path.sep + imageName);
    }

    return imageSet;
};

/**
 * Creates an image set containing the reference, new and diff images.
 *
 * @param imageName The name of the image. The name is the same for the reference, new and diff images.
 * @param referenceImage The reference jimp loaded image.
 * @param newImage The new jimp loaded image.
 * @param diffImage The diff jimp loaded image.
 * @param difference The percentual pixel difference between the reference and new image.
 * @param distance The hammond distance between the reference and new image.
 * @param error The error. E.g. something like: 'There exists no base image for this new image yet'.
 *
 * @return The constructed image set containing the information.
 * **/
ImageManipulator.prototype.createCompleteImageSet = function(imageName, referenceImage, newImage, diffImage, difference, distance, error){
    var imageSet = new ImageSetModel();
    var referenceImageModel = imageSet.getReferenceImage();
    var newImageModel = imageSet.getNewImage();
    var diffImageModel = imageSet.getDiffImage();

    imageSet.setDifference(difference);
    imageSet.setDistance(distance);
    imageSet.setError(error);

    referenceImageModel.setName(imageName);
    referenceImageModel.setHeight(referenceImage.bitmap.height);
    referenceImageModel.setWidth(referenceImage.bitmap.width);
    referenceImageModel.setPath(config.getReferenceImageFolderPath() + path.sep + imageName);

    newImageModel.setName(imageName);
    newImageModel.setHeight(newImage.bitmap.height);
    newImageModel.setWidth(newImage.bitmap.width);
    newImageModel.setPath(config.getNewImageFolderPath() + path.sep + imageName);

    diffImageModel.setName(imageName);
    diffImageModel.setHeight(diffImage.bitmap.height);
    diffImageModel.setWidth(diffImage.bitmap.width);
    diffImageModel.setPath(config.getResultImageFolderPath() + path.sep + imageName);

    return imageSet;
};

/* ----- Other helper methods ----- */

/**
 * Autocrops two images.
 *
 * @param {Image} image1 The first image to autocrop.
 * @param {Image} image2 The second image to autocrop.
 * @param {bool} autoCrop If true, the images will be autocroped, else not.
 * **/
ImageManipulator.prototype.__autoCrop = function (image1, image2, autoCrop) {
    if(autoCrop){
        image1.autocrop();
        image2.autocrop();
    }
};

/**
 * Checks whether an image exists.
 *
 * @param {string} imagePath The path to the image, which should be checked.
 * @return {bool} True if the image does exist, else false.
 * **/
ImageManipulator.prototype.__isImageExisting = function (imagePath) {
    return fs.existsSync(imagePath) && fs.statSync(imagePath).isFile();
};

/**
 * Deletes a file.
 * @param {string} path The file which should be deleted.
 * **/
ImageManipulator.prototype.__deleteFile = function (path) {
    if(this.__isImageExisting(path)){
        fs.unlink(path, function (err) {
            if(err){
                logger.error('Failed to delete file: ' + path, err);
                throw Error('Failed to delete file: ' + path, err);
            }
        });
    }
};

/**
 * Sets the ignore areas by setting the ignore areas pixel of the new image to the pixels of the reference image.
 * Because the images are the same in these areas, the resulting diff image will look ok in these areas.
 *
 * @param {Image} referenceImage The reference image.
 * @param {Image} newImage The new image which will be manipulated.
 * @param {IgnoreArea[]} ignoreAreas The areas which should be ignored.
 * **/
ImageManipulator.prototype.__setIgnoreAreas = function (referenceImage, newImage, ignoreAreas) {
    // ToDo: Add some error handling if the images do not have the same size
    if(ignoreAreas) {
        ignoreAreas.forEach(function (ignoreArea) {
            for(var xPosition = ignoreArea.x; xPosition < ignoreArea.x + ignoreArea.width; xPosition++) {
                for(var yPosition = ignoreArea.y; yPosition < ignoreArea.y + ignoreArea.height; yPosition++) {
                    var referencePixelColour = referenceImage.getPixelColor(xPosition, yPosition);
                    newImage.setPixelColor(referencePixelColour, xPosition, yPosition);
                }
            }
        });
    }
};

module.exports = ImageManipulator;