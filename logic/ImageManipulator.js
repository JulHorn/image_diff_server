var jimp = require('jimp');
var fs = require('fs-extra');
var path = require('path');
var config = require('./configurationLoader');
var ImageSetModel = require('./model/ImageSetModel');
var ImageMetaInformationModel = require('./model/ImageMetaInformationModel');
var logger = require('winston');

var ImageManipulator = function () {
    this.imageMetaInformationModel = ImageMetaInformationModel;
};

/**
 * Does not update the meta informations!
 * **/
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

            // Create diff, ensure that folder structure exists and write file
            var diff = jimp.diff(referenceImage, newImage);
            that.__ensureThatFolderStructureExist(config.getReferenceImageFolderPath());
            diff.image.write(diffImagePath);

            // Create data structure for the gathering of meta informations (distance and difference are between 0 and 0 -> * 100 for percent)
            callback(that.__createCompleteImageSet(imageName, referenceImage, newImagePath, diff.image, diff.percent * 100, jimp.distance(referenceImage, newImage) * 100, ''));
        });
    });
};

ImageManipulator.prototype.createDiffImages = function (autoCrop) {
    var that = this;

    this.__ensureThatFolderStructureExist(config.getReferenceImageFolderPath());
    this.__ensureThatFolderStructureExist(config.getNewImageFolderPath());

    fs.readdir(config.getReferenceImageFolderPath(), 'utf8', function (err, refImageNames) {
        fs.readdir(config.getNewImageFolderPath(), 'utf8', function (err, newImageNames) {
            // Get images that exist in both or only in one folder
            var imageNames = that.__getImageNames(refImageNames, newImageNames, false);
            var refDiffImageNames = that.__getImageNames(refImageNames, newImageNames, true);
            var newDiffImageNames = that.__getImageNames(newImageNames, refImageNames, true);
            var imageNamesPromise = await(imageNames.length);

            that.__createSingleImages(refDiffImageNames, newDiffImageNames, imageNamesPromise);
            that.__createDiffImages(imageNames, autoCrop);

            // Need to ensure that the operation is truly finished here...
            // Emulate that this actually works
        });
    });
};

// Hmm, how to figure out that this is finished? Not sure the callback really does what it should...
ImageManipulator.prototype.__createDiffImages = function (imageNames, autoCrop, promise) {
    var that = this;
    var jobCounter = 0;
    var numberOfJobs = imageNames.length;

    imageNames.forEach(function (imageName) {
        that.createDiffImage(imageName, autoCrop, function (resultSet) {
            // Only add images if a a threshold was breached
            if(resultSet.getDistance() > config.getMaxDistanceDifferenceThreshold()
                || resultSet.getDifference() > config.getMaxPixelDifferenceThreshold()){
                that.imageMetaInformationModel.addImageSet(resultSet);
                logger.info('Image breached threshold:', imageName);
            }
            // Increase the number of finshed jobs
            jobCounter++;

            // Save meta information when all jobs have finished
            if(jobCounter === numberOfJobs){
                that.__saveMetaInformation();
            }
        });
    });
};

ImageManipulator.prototype.__saveMetaInformation = function () {
    this.imageMetaInformationModel.calculateBiggestDifferences();
    this.imageMetaInformationModel.setTimeStamp(new Date().toISOString());
    this.imageMetaInformationModel.save();
};

// Hmm, how to figure out that this is finished? Not sure the callback really does what it should...
ImageManipulator.prototype.__createSingleImages = function (refImageNames, newImageNames, callback) {
    var that = this;
    var numberOfJobs = newImageNames.length + refImageNames.length;
    var jobCounter = 0;

    // New images
    newImageNames.forEach(function (newImageName) {
        jimp.read(config.getNewImageFolderPath() + path.sep + newImageName, function (err, newImage){
            that.imageMetaInformationModel.addImageSet(that.__createSingleImageSet(newImageName, newImage, 'There is no reference image existing yet.', false));

            // Increase the number of finshed jobs
            jobCounter++;
            // Save meta information when all jobs have finished
            if(jobCounter === numberOfJobs){
                that.__saveMetaInformation();
            }
        });
    });

    // Reference images
    refImageNames.forEach(function (refImageName) {
        jimp.read(config.getReferenceImageFolderPath() + path.sep + refImageName, function (err, refImage){
            that.imageMetaInformationModel.addImageSet(that.__createSingleImageSet(refImageName, refImage, 'There is no new image existing. Reference outdated?', true));
            // Increase the number of finshed jobs
            jobCounter++;

            // Save meta information when all jobs have finished
            if(jobCounter === numberOfJobs){
                that.__saveMetaInformation();
            }
        });
    });
};

ImageManipulator.prototype.__getImageNames = function(fileNameArray1, fileNameArray2, differentImages){

    // Get the images that are only in the first array
    if(differentImages){
        return fileNameArray1.filter(function(element){
            return !fileNameArray2.includes(element) && element.toLowerCase().endsWith('.png');
        });
    }

    // Get the images that are in both arrays
    return fileNameArray1.filter(function(element){
        return fileNameArray2.includes(element) && element.toLowerCase().endsWith('.png');
    });
};

ImageManipulator.prototype.__autoCrop = function (image1, image2, autoCrop) {
    if(autoCrop){
        image1.autocrop();
        image2.autocrop();
    }
};

ImageManipulator.prototype.__ensureThatFolderStructureExist= function(folder){
    if(!fs.statSync(folder).isDirectory()){
        fs.mkdirsSync(folder);
    }
};

ImageManipulator.prototype.__checkImageExists = function (imagePath) {
    return fs.statSync(imagePath).isFile();
};

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

module.exports = ImageManipulator;