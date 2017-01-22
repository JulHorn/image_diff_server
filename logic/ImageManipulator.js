var jimp = require('jimp');
var fs = require('fs-extra');
var path = require('path');
var config = require('./ConfigurationLoader');
var ImageSetModel = require('./model/ImageSetModel');
var ImageMetaInformationModel = require('./model/ImageMetaInformationModel');
var logger = require('winston');
var jobHandler = require('./JobHandler');

/**
 * Constructor.
 * **/
var ImageManipulator = function () {
    this.imageMetaInformationModel = ImageMetaInformationModel;
};

/* ----- Create Methods ----- */

/**
 * Creates a diff image of the reference and new image and saves it to the, in the configuration file configured, folder path.
 * Does not update the meta information itself.
 *
 * @param imageName The name of the images that should be compared. The image must have the same name in the reference and new folder. The diff image will have the name, too.
 * @param autoCrop Determines if the new/reference images should be autocroped before comparison to yield better results if the sometimes differ in size. Must be a boolean.
 * @param callback The callback function which is called, when the method has finished the comparison. The callback has an imageSet as job.
 * **/
ImageManipulator.prototype.createDiffImage = function (imageName, autoCrop, callback) {

    // Other vars
    var that = this;

    // Assign default value value is falsy
    autoCrop = autoCrop || false;

    // Get images
    var referenceImagePath = config.getReferenceImageFolderPath() + path.sep + imageName;
    var newImagePath = config.getNewImageFolderPath() + path.sep + imageName;
    var diffImagePath = config.getResultImageFolderPath() + path.sep + imageName;
    logger.info('Creating diff image for:', imageName);

    // If one of the images do not exist, then quit
    if(!this.__isImageExisting(referenceImagePath) || !this.__isImageExisting(newImagePath)){
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
                var errorText = 'Image dimensions are not equal: '
                    + 'reference: ' + referenceImage.bitmap.height + '/' + referenceImage.bitmap.width
                    + 'reference: ' + referenceImage.bitmap.height + '/' + referenceImage.bitmap.width;
                logger.error(errorText);
                throw Error(errorText);
            }

            // Autocrop if argument is given to normalalize images
            that.__autoCrop(referenceImage, newImage, autoCrop);

            // Create diff, ensure that folder structure exists and write file
            var diff = jimp.diff(referenceImage, newImage);
            that.__ensureThatFolderStructureExist(config.getResultImageFolderPath());
            diff.image.write(diffImagePath, function () {
                // Update the processed image count
                jobHandler.incrementProcessImageCounter();
                // Create data structure for the gathering of meta informations (distance and difference are between 0 and 0 -> * 100 for percent)
                callback(that.__createCompleteImageSet(imageName, referenceImage, newImage, diff.image, diff.percent * 100, jimp.distance(referenceImage, newImage) * 100, ''));
            });
        });
    });
};

/**
 * Computes diff images for all images with the same name in the reference/new folder (configured in the config file). The diff images will
 * written in the diff image folder. Updated the meta structure.
 *
 * @param autoCrop Determines if the new/reference images should be autocroped before comparison to yield better results if the sometimes differ in size. Must be a boolean.
 * @param pixDiffThreshold The pixel threshold.
 * @param distThreshold The distance threshold.
 * @param callback The callback method which is called, when diff process as finished. Has the ImageMetaInformationModel as job. Optional.
 * **/
ImageManipulator.prototype.createDiffImages = function (autoCrop, pixDiffThreshold, distThreshold, callback) {
    var that = this;

    // Ensure that the folders which should contain the images exist
    this.__ensureThatFolderStructureExist(config.getReferenceImageFolderPath());
    this.__ensureThatFolderStructureExist(config.getNewImageFolderPath());

    logger.info("Trying to load reference images from:", config.getReferenceImageFolderPath());
    logger.info("Trying to load new images from:", config.getNewImageFolderPath());

    // Read supported images
    var refImageNames = fs.readdirSync(config.getReferenceImageFolderPath()).filter(this.__imageFilter);
    var newImageNames = fs.readdirSync(config.getNewImageFolderPath()).filter(this.__imageFilter);

    logger.info("Reference images loaded:", refImageNames.length);
    logger.info("New images loaded:", newImageNames.length);

    // Get images that exist in both or only in one folder
    var imageNames = that.__getImageNames(refImageNames, newImageNames, false);
    var refDiffImageNames = that.__getImageNames(refImageNames, newImageNames, true);
    var newDiffImageNames = that.__getImageNames(newImageNames, refImageNames, true);

    // Tell the job how many images have to be processed
    jobHandler.setImagesToBeProcessedCount(refDiffImageNames.length + newDiffImageNames.length + imageNames.length);

    // Create diff images
    that.__createSingleImages(refDiffImageNames, newDiffImageNames, function () {
        that.__createDiffImages(imageNames, autoCrop, pixDiffThreshold, distThreshold, function () {
            that.__saveMetaInformation();
            if(callback) {
                callback(that.imageMetaInformationModel);
            }
        });
    });

};

/**
 * Makes a new image to a reference image. Updates and save the meta information model.
 *
 * @param id Id of the image set for which the new image should be made a reference image.
 * @param callback Called when the complete deletion process is done. Has the updated image meta information model object as job.
 * **/
ImageManipulator.prototype.makeToNewReferenceImage = function (id, callback) {
    var imageSet = ImageMetaInformationModel.getImageSetById(id);
    var that = this;

    logger.info('Attempting to copy ' + imageSet.getNewImage().getPath() + ' to ' + config.getReferenceImageFolderPath() + path.sep + imageSet.getNewImage().getName());

    fs.copy(imageSet.getNewImage().getPath(), config.getReferenceImageFolderPath() + path.sep + imageSet.getNewImage().getName(), function (err) {

        // Error handling
        if(err){
            throw Error('Failed to copy new image reference images.', err);
        }

        // Create diff -> Autocrop is set to false because the images should be identical
        that.createDiffImage(imageSet.getNewImage().getName(), false, function (resultSet) {
            // Set new diff information to existing image set
            imageSet.setDifference(resultSet.getDifference());
            imageSet.setError(resultSet.getError());
            imageSet.setDistance(resultSet.getDistance());
            imageSet.setReferenceImage(resultSet.getReferenceImage());
            imageSet.setDiffImage(resultSet.getDiffImage());

            // Save meta information
            ImageMetaInformationModel.calculateBiggestDifferences();
            ImageMetaInformationModel.setTimeStamp(new Date().toISOString());
            ImageMetaInformationModel.save();

            // Call callback
            if(callback){
                callback(ImageMetaInformationModel);
            }
        });
    });
};

/**
 * Deletes an image set. It will be removed from the image meta information structure, the structure will be saved to file
 * and the images will be deleted.
 *
 * @param id The id of the image set.
 * @param callback Called when the complete deletion process is done. Has the updated image meta information model object as job.
 * **/
ImageManipulator.prototype.deleteImageSet = function (id, callback) {
    var imageSet = this.imageMetaInformationModel.getImageSetById(id);

    // Delete image which are part of the set
    this.__deleteFile(imageSet.getReferenceImage().getPath());
    this.__deleteFile(imageSet.getNewImage().getPath());
    this.__deleteFile(imageSet.getDiffImage().getPath());

    // Delete information about the data set and save the information
    this.imageMetaInformationModel.deleteImageSet(id);
    this.__saveMetaInformation();

    logger.info('Deleted image set with id:', id);

    // Call callback when stuff is done
    if(callback){
        callback(this.imageMetaInformationModel);
    }
};

/* ----- Creation Helper Methods ----- */

/**
 * Creates diff images of images with the same name in the reference/new folder.
 * Updates the image meta information structure, but does not save it.
 *
 * @param imageNames Array of image names which should be compared.
 * @param autoCrop Determines if the new/reference images should be autocroped before comparison to yield better results if the sometimes differ in size. Must be a boolean.
 * @param pixDiffThreshold
 * @param distThreshold
 * @param callback Will be called, when the method has finished to compute all images. Has the number of processed images as job.
 * **/
ImageManipulator.prototype.__createDiffImages = function (imageNames, autoCrop, pixDiffThreshold, distThreshold, callback) {

    logger.info("Number of images left to compare: ", imageNames.length);
    // If no images are left to process, call the callback method and stop
    if(imageNames.length == 0) {
        logger.info('No images left to compare.');
        if(callback){
            callback();
        }

    } else {

        // Create diff image
        var imageToProcess = imageNames.shift();
        var that = this;
        that.createDiffImage(imageToProcess, autoCrop, function (resultSet) {
            // Only add images if a a threshold was breached
            if (resultSet.getDistance() > distThreshold
                || resultSet.getDifference() > pixDiffThreshold) {
                that.imageMetaInformationModel.addImageSet(resultSet);
            }

            that.__createDiffImages(imageNames, autoCrop, pixDiffThreshold, distThreshold, callback);
        });
    }
};

/**
 * Adds images with new reference/new pedant to the image meta information structure.
 * Updates the image meta information structure, but does not save it.
 *
 * @param refImageNames Array of image names which exist in the reference image folder, but not in the new image folder.
 * @param newImageNames Array of image names which exist in the new image folder, but not in the new reference folder.
 * @param callback Will be called, when the method has finished to compute all images. Has the number of processed images as job.
 * **/
ImageManipulator.prototype.__createSingleImages = function (refImageNames, newImageNames, callback) {
    var that = this;

    if(refImageNames.length == 0 && newImageNames.length == 0) {
        logger.info('No single images left to process.');
        callback();
    } else {

        logger.info('Single images left to process:', refImageNames.length + newImageNames.length);

        // New and ref images
        if(newImageNames.length > 0) {
            var newImageName = newImageNames.shift();

            jimp.read(config.getNewImageFolderPath() + path.sep + newImageName, function (err, newImage) {
                that.imageMetaInformationModel.addImageSet(that.__createSingleImageSet(newImageName, newImage, 'There is no reference image existing yet.', false));
                that.__createSingleImages(refImageNames, newImageNames, callback);
            });
        } else if(refImageNames.length > 0) {
            var refImageName = refImageNames.shift();

            // Reference images
            jimp.read(config.getReferenceImageFolderPath() + path.sep + refImageName, function (err, refImage) {
                that.imageMetaInformationModel.addImageSet(that.__createSingleImageSet(refImageName, refImage, 'There is no new image existing. Reference outdated?', true));
                that.__createSingleImages(refImageNames, newImageNames, callback);
            });
        }
    }
};

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
ImageManipulator.prototype.__createSingleImageSet = function (imageName, image, error, isReferenceImage) {
    var imageSet = new ImageSetModel();

    // Set error values
    imageSet.setError(error);
    imageSet.setDifference(100);
    imageSet.setDistance(100);

    // Edit set dependant of the image type
    if(isReferenceImage) {
        imageSet.getReferenceImage().setHeight(image.bitmap.height);
        imageSet.getReferenceImage().setWidth(image.bitmap.width);
        imageSet.getReferenceImage().setName(imageName);
        imageSet.getReferenceImage().setPath(config.getReferenceImageFolderPath() + path.sep + imageName);
    } else {
        imageSet.getNewImage().setHeight(image.bitmap.height);
        imageSet.getNewImage().setWidth(image.bitmap.width);
        imageSet.getNewImage().setName(imageName);
        imageSet.getNewImage().setPath(config.getNewImageFolderPath() + path.sep + imageName);
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
ImageManipulator.prototype.__createCompleteImageSet = function(imageName, referenceImage, newImage, diffImage, difference, distance, error){
    var imageSet = new ImageSetModel();

    imageSet.setDifference(difference);
    imageSet.setDistance(distance);
    imageSet.setError(error);

    imageSet.getReferenceImage().setName(imageName);
    imageSet.getReferenceImage().setHeight(referenceImage.bitmap.height);
    imageSet.getReferenceImage().setWidth(referenceImage.bitmap.width);
    imageSet.getReferenceImage().setPath(config.getReferenceImageFolderPath() + path.sep + imageName);

    imageSet.getNewImage().setName(imageName);
    imageSet.getNewImage().setHeight(referenceImage.bitmap.height);
    imageSet.getNewImage().setWidth(referenceImage.bitmap.width);
    imageSet.getNewImage().setPath(config.getNewImageFolderPath() + path.sep + imageName);

    imageSet.getDiffImage().setName(imageName);
    imageSet.getDiffImage().setHeight(referenceImage.bitmap.height);
    imageSet.getDiffImage().setWidth(referenceImage.bitmap.width);
    imageSet.getDiffImage().setPath(config.getResultImageFolderPath() + path.sep + imageName);

    return imageSet;
};

/* ----- Other helper methods ----- */

/**
 * Gets the images which are in one array and not the other or which in both arrays.
 *
 * @param fileNameArray1 The first array.
 * @param fileNameArray2 The second array.
 * @param differentImages If true, returns the the images which are in array 1 and not array 2. If false, returns the images
 * which are in both arrays.
 * **/
ImageManipulator.prototype.__getImageNames = function(fileNameArray1, fileNameArray2, differentImages){

    // Get the images that are only in the first array
    if(differentImages){
        return fileNameArray1.filter(function(element){
            return !fileNameArray2.includes(element);
        });
    }

    // Get the images that are in both arrays
    return fileNameArray1.filter(function(element){
        return fileNameArray2.includes(element);
    });
};

/**
 * Calculates the the biggest percentual pixel difference/distance, sets the timestamp and saves the image meta information structure
 * to file.
 * **/
ImageManipulator.prototype.__saveMetaInformation = function () {
    this.imageMetaInformationModel.calculateBiggestDifferences();
    this.imageMetaInformationModel.setTimeStamp(new Date().toISOString());
    this.imageMetaInformationModel.save();
};

/**
 * Autocrops two images.
 *
 * @param image1 The first image to autocrop.
 * @param image2 The second image to autocrop.
 * @param autoCrop Boolean. If true, the images will be autocroped, else not.
 * **/
ImageManipulator.prototype.__autoCrop = function (image1, image2, autoCrop) {
    if(autoCrop){
        image1.autocrop();
        image2.autocrop();
    }
};

/**
 * Ensures that the folder structure exists, if it does not already exist.
 *
 * @param folder The folder which should be created, if it does not already exist.
 * **/
ImageManipulator.prototype.__ensureThatFolderStructureExist = function(folder){
    fs.ensureDirSync(folder);
};

/**
 * Checks whether an image exists.
 *
 * @param imagePath The path to the image, which should be checked.
 * @return True if the image does exist, else false.
 * **/
ImageManipulator.prototype.__isImageExisting = function (imagePath) {
    try{
        fs.accessSync(imagePath);
        return fs.statSync(imagePath).isFile();
    } catch(err) {
        return false;
    }
};

/**
 * A simple filter function for arrays to determine wheter a file is one of the supported image types.
 *
 * @param imageName The image name including its type suffix.
 * **/
ImageManipulator.prototype.__imageFilter = function (imageName) {
    return imageName.toLowerCase().endsWith('.png');
};

/**
 * Deletes a file.
 *
 * @param path The file which should be deleted.
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

module.exports = ImageManipulator;