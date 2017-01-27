var config = require('config');
var path = require('path');

/**
 * Constructor.
 * **/
var Configuration = function () {
    
};

/* ----- Methods ----- */

/**
 * Returns the base config.
 * **/
Configuration.prototype.getBaseConf = function () {
    return config;
};

/**
 * Returns the server configuration.
 * **/
Configuration.prototype.getServerConf = function () {
    return this.getBaseConf().get('server');
};

/**
 * Returns the server port (the application will be reachable under this port) of the server config.
 * **/
Configuration.prototype.getServerPort = function () {
    return this.getServerConf().get('port');
};

/**
 * Returns the amount of milliseconds after which a request should timeout.
 * **/
Configuration.prototype.getRequestTimeout = function () {
    return this.getServerConf().get('timeoutInMs');
};

/**
 * Returns the working mode. Currently 0 = "discard" or 1 = "queue".
 * **/
Configuration.prototype.getWorkingMode = function () {
    return this.getServerConf().get('workingMode');
};

/**
 * Returns the image configuration.
 * **/
Configuration.prototype.getImagesConfig = function () {
    return this.getBaseConf().get('images');
};

/**
 * Returns the folder path in which the reference images are stored.
 * **/
Configuration.prototype.getReferenceImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('referenceImageFolder'));
};

/**
 * Returns the folder path in which the new images are stored.
 * **/
Configuration.prototype.getNewImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('newImageFolder'));
};

/**
 * Returns the folder path in which the diff images will be stored.
 * **/
Configuration.prototype.getResultImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('resultImageFolder'));
};

/**
 * Returns the file path in which the imageMetaInformationModel information for the images will be stored.
 * **/
Configuration.prototype.getMetaInformationFilePath = function () {
    return path.normalize(this.getImagesConfig().get('metaInformationFile'));
};

/**
 * Returns the folder path in which the imageMetaInformationModel information file for the images will be stored.
 * **/
Configuration.prototype.getMetaInformationFolderPath = function () {
    return path.dirname(this.getMetaInformationFilePath());
};

/**
 * Returns the threshold configuration.
 * **/
Configuration.prototype.getThresholdConf = function () {
    return this.getBaseConf().get('thresholds');
};

/**
 * Returns the maximum allowed percentual pixel difference before the images will be added to the result set.
 * **/
Configuration.prototype.getMaxPixelDifferenceThreshold = function () {
    return this.getThresholdConf().get('maxPercentualImagePixelDifference');
};

/**
 * Returns the maximum allowed hammond distance before the images will be added to the result set.
 * **/
Configuration.prototype.getMaxDistanceDifferenceThreshold = function () {
    return this.getThresholdConf().get('maxImageImageDistanceDifference');
};

/**
 * Returns the option configuration.
 * **/
Configuration.prototype.getOptions = function () {
    return this.getBaseConf().get('options');
};

/**
 * Returns if the images should be auto cropped before they are compared.
 * **/
Configuration.prototype.getAutoCropOption = function () {
    return this.getOptions().get('autoCrop');
};

module.exports = new Configuration();