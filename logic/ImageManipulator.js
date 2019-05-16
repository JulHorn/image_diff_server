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
 * @param {MarkedArea[]} ignoreAreas The areas which will not be part of the comparison.
 * @param {MarkedArea[]} checkAreas Areas which will be used for checking. Everything not part of such an areay will be ignored (only when there is at least one).
 * @param {Function} callback The callback function which is called, when the method has finished the comparison. The callback has an imageSet as job.
 * **/
ImageManipulator.prototype.createDiffImage = function (imageName, autoCrop, ignoreAreas, checkAreas, callback) {
    // Other vars
    var that = this;
	ignoreAreas = ignoreAreas || [];
	checkAreas = checkAreas || [];

    // Assign default value, if no value was given
    autoCrop = autoCrop || false;

    // Get images
    var referenceImagePath = config.getReferenceImageFolderPath() + path.sep + imageName;
    var newImagePath = config.getNewImageFolderPath() + path.sep + imageName;
    logger.info('Creating diff image for:', imageName);

    // If one of the images does not exist, then quit
    if(!this.isImageExisting(referenceImagePath) || !this.isImageExisting(newImagePath)){
        var errorText = 'Reference or new image does not exist but should exist:\n'
            + 'Reference: ' + referenceImagePath
            + "\n"
            +  'New: ' + newImagePath;

        logger.error(errorText);
        callback(that.createCompleteImageSet(imageName, null, null, null, 100, 100, errorText));
        return;
    }

    // Compute differences
    this.loadImage(referenceImagePath, function (err, referenceImage) {
        that.loadImage(newImagePath, function (err, newImage) {
            that.__createDiffImage(imageName, newImage, referenceImage, autoCrop, ignoreAreas, checkAreas, callback);
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
    imageSet.setThresholdBreachedState(true);

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
    var isThresholdBreached = distance > config.getMaxDistanceDifferenceThreshold() || difference > config.getMaxPixelDifferenceThreshold();

    imageSet.setDifference(difference);
    imageSet.setDistance(distance);
    imageSet.setError(error);

    imageSet.setThresholdBreachedState(isThresholdBreached);

    referenceImageModel.setName(imageName);
    referenceImageModel.setPath(config.getReferenceImageFolderPath() + path.sep + imageName);

    if(referenceImage) {
        referenceImageModel.setHeight(referenceImage.bitmap.height);
        referenceImageModel.setWidth(referenceImage.bitmap.width);
    }

    newImageModel.setName(imageName);
    newImageModel.setPath(config.getNewImageFolderPath() + path.sep + imageName);

    if(newImage) {
        newImageModel.setHeight(newImage.bitmap.height);
        newImageModel.setWidth(newImage.bitmap.width);
    }

    diffImageModel.setName(imageName);
    diffImageModel.setPath(config.getResultImageFolderPath() + path.sep + imageName);

    if(diffImage) {
        diffImageModel.setHeight(diffImage.bitmap.height);
        diffImageModel.setWidth(diffImage.bitmap.width);
    }

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
ImageManipulator.prototype.isImageExisting = function (imagePath) {
    return fs.existsSync(imagePath) && fs.statSync(imagePath).isFile();
};

/**
 * Deletes a file.
 * @param {string} path The file which should be deleted.
 * **/
ImageManipulator.prototype.__deleteFile = function (path) {
    if(this.isImageExisting(path)){
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
 * ToDo: Update
 * @param {Image} referenceImage The reference image.
 * @param {Image} newImage The new image which will be manipulated.
 * @param {MarkedArea[]} ignoreAreas The areas which should be ignored.
 * @param {MarkedArea[]} checkAreas Areas which will be used for checking. Everything not part of such an areay will be ignored (only when there is at least one).
 * @throws {String} Thrown, if an ignore area is out of bounds.
 * **/
ImageManipulator.prototype.__applyMarkedAreas = function (referenceImage, newImage, ignoreAreas, checkAreas) {
	// ToDo: Probably move this to the autocrop function -> Adapt? Error message/Note
	var usableImageWidth = newImage.bitmap.width >= referenceImage.bitmap.width ? referenceImage.bitmap.width : newImage.bitmap.width;
	var usableImageHeight = newImage.bitmap.height >= referenceImage.bitmap.height ? referenceImage.bitmap.height : newImage.bitmap.height;
	var resultImage = newImage;

	referenceImage.crop(0, 0, usableImageWidth, usableImageHeight);
	newImage.crop(0, 0, usableImageWidth, usableImageHeight);

	if(ignoreAreas) {
		// Apply the ignore area stuff
		this.__iterateThroughMarkedAreas(ignoreAreas, usableImageWidth, usableImageHeight, function(xPosition, yPosition) {
			var referencePixelColour = referenceImage.getPixelColor(xPosition, yPosition);
			newImage.setPixelColor(referencePixelColour, xPosition, yPosition);
		});
    }
	// ToDo: Color marked regions and add doku
	if (checkAreas) {
		resultImage = referenceImage.clone();

		this.__iterateThroughMarkedAreas(checkAreas, usableImageWidth, usableImageHeight, function(xPosition, yPosition) {
			var newImageColour = newImage.getPixelColor(xPosition, yPosition);
			resultImage.setPixelColor(newImageColour, xPosition, yPosition);
		});
	}
	return resultImage;
};

/**
 * ToDo
 * @param image
 * @param markedAreas
 * @param r
 * @param g
 * @param b
 * @private
 */
ImageManipulator.prototype.__drawMarkedAreaBoxes = function(image, markedAreas, r, g, b) {
	var targetColor = jimp.rgbaToInt(r, g, b, 200);

	if (markedAreas) {
		markedAreas.forEach(function(markedArea) {
			var xPosition = 0;
			for (xPosition = markedArea.getX(); xPosition < markedArea.getX() + markedArea.getWidth(); xPosition++) { image.setPixelColor(targetColor, xPosition, markedArea.getY()); }
			for (xPosition = markedArea.getX(); xPosition < markedArea.getX() + markedArea.getWidth(); xPosition++) { image.setPixelColor(targetColor, xPosition, markedArea.getY() + markedArea.getHeight()); }

			var yPosition = 0;
			for (yPosition = markedArea.getY(); yPosition < markedArea.getY() + markedArea.getHeight(); yPosition++) { image.setPixelColor(targetColor, markedArea.getX(), yPosition); }
			for (yPosition = markedArea.getY(); yPosition < markedArea.getY() + markedArea.getHeight(); yPosition++) { image.setPixelColor(targetColor, markedArea.getX() + markedArea.getWidth(), yPosition); }
		});
		console.log('yeah');
	}
};

/**
 * Creates a diff image of the reference and new image and saves it to the, in the config file configured, folder path.
 * Does not update the imageMetaInformationModel information itself.
 *
 * @param {String} imageName The name of the images that should be compared. The image must have the same name in the reference and new folder. The diff image will have the name, too.
 * @param {Object} newImage The new image.
 * @param {Object} referenceImage The reference image.
 * @param {Boolean} autoCrop Determines if the new/reference images should be auto croped before comparison to yield better results if the sometimes differ in size. Must be a boolean.
 * @param {MarkedArea[]} ignoreAreas The areas which will not be part of the comparison.
 * @param {MarkedArea[]} checkAreas Areas which will be used for checking. Everything not part of such an areay will be ignored (only when there is at least one).
 * @param {Function} callback The callback function which is called, when the method has finished the comparison. The callback has an imageSet as job.
 */
ImageManipulator.prototype.__createDiffImage = function(imageName, newImage, referenceImage, autoCrop, ignoreAreas, checkAreas, callback) {
	var errorText = '';
	var that = this;
	var diffImagePath = config.getResultImageFolderPath() + path.sep + imageName;
	// The image used for the comparison, might change because of marked areas
	var newImageUsedForComparison = newImage;

	// If the image size is not identical
	if((referenceImage.bitmap.height !== newImage.bitmap.height
		|| referenceImage.bitmap.width !== newImage.bitmap.width)){
		errorText = 'Image dimensions are not equal: '
					+ '\nreference: ' + referenceImage.bitmap.height + '/' + referenceImage.bitmap.width
					+ '\nnew: ' + newImage.bitmap.height + '/' + newImage.bitmap.width;
		logger.error(errorText);
	}

	try {
		// Add ignore areas, which should not be part of the comparison
		newImageUsedForComparison = this.__applyMarkedAreas(referenceImage, newImage, ignoreAreas, checkAreas);
	} catch(err) {
		errorText = err;
	}

	// Autocrop if argument is given to normalize images
	// ToDo: Still necessary?
	this.__autoCrop(referenceImage, newImage, autoCrop);

	// Create diff, ensure that folder structure exists and write file
	var diff = jimp.diff(referenceImage, newImageUsedForComparison);

	// Draw marked area boundaries after diff was done to exclude them from te comparison
	this.__drawMarkedAreaBoxes(diff.image, ignoreAreas, 255, 0, 100);
	this.__drawMarkedAreaBoxes(diff.image, checkAreas, 0, 255, 100);

	fs.ensureDirSync(config.getResultImageFolderPath());

	diff.image.write(diffImagePath, function () {
		// Create data structure for the gathering of imageMetaInformationModel information (distance and difference are between 0 and 0 -> * 100 for percent)
		// Use the original newImage again because we do not want to falsifiy the information about the original image
		callback(that.createCompleteImageSet(imageName, referenceImage, newImage, diff.image, diff.percent * 100, jimp.distance(referenceImage, newImage) * 100, errorText));

	});
};

/**
 * ToDo
 * @param markedAreas
 * @param usableImageWidth
 * @param usableImageHeight
 * @param callback
 * @private
 */
ImageManipulator.prototype.__iterateThroughMarkedAreas = function(markedAreas, usableImageWidth, usableImageHeight, callback) {
	markedAreas.forEach(function (markedArea) {
		for(var xPosition = markedArea.x; xPosition >= markedArea.x && xPosition <= markedArea.x + markedArea.width && xPosition <= usableImageWidth; xPosition++) {
			for(var yPosition = markedArea.y; yPosition >= markedArea.y && yPosition <= markedArea.y + markedArea.height && yPosition <= usableImageHeight; yPosition++) {
				if (callback) {
					callback(xPosition, yPosition);
				}
			}
		}
	});
};

module.exports = ImageManipulator;