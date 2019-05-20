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
 * ToDo: Low prio: Remove autocrop from here and access the config directly
 *
 * @param {String} imageName The name of the images that should be compared. The image must have the same name in the reference and new folder. The diff image will have the name, too.
 * @param {Boolean} autoCrop Determines if the new/reference images should be auto cropped before comparison to yield better results if the sometimes differ in size. Must be a boolean.
 * @param {MarkedArea[]} ignoreAreas The areas which will not be part of the comparison.
 * @param {MarkedArea[]} checkAreas Areas which will be used for checking. Everything not part of such an areay will be ignored (only when there is at least one).
 * @param {Function} callback The callback function which is called, when the method has finished the comparison. The callback has an imageSet as job.
 * **/
ImageManipulator.prototype.createDiffImage = function (imageName, autoCrop, ignoreAreas, checkAreas, callback) {
    // Other vars
    var that = this;
	// Assign default values if no value was given
	ignoreAreas = ignoreAreas || [];
	checkAreas = checkAreas || [];
    autoCrop = autoCrop || true;

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
    var isThresholdBreached = difference > config.getMaxPixelDifferenceThreshold();

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
 * Autocrops two images. Cuts the bigger image to the dimension of the smaller image.
 * Cuts the images to match defined checkAreas for the imageSet.
 *
 * @param {Image} image1 The first image to autocrop.
 * @param {Image} image2 The second image to autocrop.
 * @param {bool} autoCrop If true, the images will be autocroped, else not.
 * @param {MarkedArea} checkAreas ToDo
 * **/
ImageManipulator.prototype.__autoCrop = function (image1, image2, autoCrop, checkAreas) {
    if(autoCrop){
		var usableDimensions = this.__calculateUsableDimension(image1, image2, checkAreas);

		image1.crop(0, 0, usableDimensions.maxUsableWidth, usableDimensions.maxUsableHeight);
		image2.crop(0, 0, usableDimensions.maxUsableWidth, usableDimensions.maxUsableHeight);
    }
};

/**
 * ToDo
 * @param image1
 * @param image2
 * @param checkAreas
 * @return {{maxUsableWidth: number, maxUsableHeight: number}}
 * @private
 */
ImageManipulator.prototype.__calculateUsableDimension = function(image1, image2, checkAreas) {
	var maxUsableWidth = 0;
	var maxUsableHeight = 0;

	// Get the most right and lowest points of all check areas
	if (checkAreas && checkAreas.length > 0) {
		checkAreas.forEach(function(checkArea) {
			var checkAreaMostRightPoint = checkArea.getX() + checkArea.getWidth();
			var checkAreaLowestPoint = checkArea.getY() + checkArea.getHeight();

			if (checkAreaMostRightPoint > maxUsableWidth) { maxUsableWidth = checkAreaMostRightPoint; }
			if (checkAreaLowestPoint > maxUsableHeight) { maxUsableHeight = checkAreaLowestPoint; }
		});
	}

	// Add some extra pixels to make the surroundings a bit more visible
	maxUsableWidth += 10;
	maxUsableHeight += 10;

	// Get the smallest usable image dimensions
	var usableImageWidth = Math.min(image1.bitmap.width, image2.bitmap.width);
	var usableImageHeight = Math.min(image1.bitmap.height, image2.bitmap.height);

	// Get the smallest matching results of checkAreas and image dimensions
	maxUsableWidth = Math.min(usableImageWidth, maxUsableWidth);
	maxUsableHeight = Math.min(usableImageHeight, maxUsableHeight);

	return { maxUsableWidth: maxUsableWidth, maxUsableHeight: maxUsableHeight }
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
 * Will apply the check areas too in a very similar fashion.
 *
 * @param {Image} referenceImage The reference image.
 * @param {Image} newImage The new image which will be manipulated.
 * @param {MarkedArea[]} ignoreAreas The areas which should be ignored.
 * @param {MarkedArea[]} checkAreas Areas which will be used for checking. Everything not part of such an areay will be ignored (only when there is at least one).
 * @throws {String} Thrown, if an ignore area is out of bounds.
 * **/
ImageManipulator.prototype.__applyMarkedAreas = function (referenceImage, newImage, ignoreAreas, checkAreas) {
	var usableDimensions = this.__calculateUsableDimension(referenceImage, newImage, checkAreas);
	var resultImage = newImage;

	// Apply the ignore area stuff
	if(ignoreAreas && ignoreAreas.length > 0) {
		this.__iterateThroughMarkedAreas(ignoreAreas, usableDimensions.maxUsableWidth, usableDimensions.maxUsableHeight, function(xPosition, yPosition) {
			var referencePixelColour = referenceImage.getPixelColor(xPosition, yPosition);
			newImage.setPixelColor(referencePixelColour, xPosition, yPosition);
		});
    }

	// Apply checkAreas
	// Cloning the reference image and than overwriting the checkArea pixels with the corresponding ones from the new image
	// should be faster in most cases because not the whole image must be iterated through
	if (checkAreas && checkAreas.length > 0) {
		resultImage = referenceImage.clone();

		this.__iterateThroughMarkedAreas(checkAreas, usableDimensions.maxUsableWidth, usableDimensions.maxUsableHeight, function(xPosition, yPosition) {
			var newImageColour = newImage.getPixelColor(xPosition, yPosition);
			resultImage.setPixelColor(newImageColour, xPosition, yPosition);
		});
	}
	return resultImage;
};

/**
 * Draws bounding boxes for the marked areas.
 *
 * @param image The image on which the bounding boxes should be drawn on.
 * @param markedAreas The marked areas for which the bounding boxes should be drawn.
 * @param r Red color 0-255.
 * @param g Green color 0-255.
 * @param b Blue color 0-255.
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
					+ '\nnew: ' + newImage.bitmap.height + '/' + newImage.bitmap.width
					+ '\nImages might be cropped to the same size depending of the set auto crop option in the config.';
		logger.error(errorText);
	}

	// Autocrop if argument is given to normalize images
	this.__autoCrop(referenceImage, newImage, autoCrop, checkAreas);

	try {
		// Add ignore areas, which should not be part of the comparison
		newImageUsedForComparison = this.__applyMarkedAreas(referenceImage, newImage, ignoreAreas, checkAreas);
	} catch(err) {
		errorText = err;
	}

	// Create diff, ensure that folder structure exists and write file
	var diff = jimp.diff(referenceImage, newImageUsedForComparison);

	// Draw marked area boundaries after diff was done to exclude them from the comparison
	if (config.getDisplayMarkedAreasOption()) {
		this.__drawMarkedAreaBoxes(diff.image, ignoreAreas, 255, 0, 100);
		this.__drawMarkedAreaBoxes(diff.image, checkAreas, 0, 255, 100);
	}

	fs.ensureDirSync(config.getResultImageFolderPath());

	diff.image.write(diffImagePath, function () {
		// Create data structure for the gathering of imageMetaInformationModel information (distance and difference are between 0 and 0 -> * 100 for percent)
		// Use the original newImage again because we do not want to falsifiy the information about the original image
		callback(that.createCompleteImageSet(imageName, referenceImage, newImage, diff.image, diff.percent * 100, jimp.distance(referenceImage, newImage) * 100, errorText));

	});
};

/**
 * Iterated through the given marked areas and calls the callback function for each pixel.
 *
 * @param markedAreas The marked areas which should be iterated through.
 * @param maxImageWidth The max image width. If a marked area lies (partially) outside, the outside parts will be ignored.
 * @param maxImageHeight The max image height. If a marked area lies (partially) outside, the outside parts will be ignored.
 * @param callback The callback function called for each pixel. Has the parameter "xPosition" and "yPosition" of the pixel of the marked area.
 * @private
 */
ImageManipulator.prototype.__iterateThroughMarkedAreas = function(markedAreas, maxImageWidth, maxImageHeight, callback) {
	markedAreas.forEach(function (markedArea) {
		for(var xPosition = markedArea.x; xPosition >= markedArea.x && xPosition <= markedArea.x + markedArea.width && xPosition <= maxImageWidth; xPosition++) {
			for(var yPosition = markedArea.y; yPosition >= markedArea.y && yPosition <= markedArea.y + markedArea.height && yPosition <= maxImageHeight; yPosition++) {
				if (callback) {
					callback(xPosition, yPosition);
				}
			}
		}
	});
};

module.exports = ImageManipulator;