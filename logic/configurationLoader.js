var config = require('config');
var path = require('path');

/**
 * Constructor.
 * **/
var conf = function () {
    
};

/* ----- Methods ----- */

/**
 * Returns the base config.
 * **/
conf.prototype.getBaseConf = function () {
    return config;
};

/**
 * Returns the server configuration.
 * **/
conf.prototype.getServerConf = function () {
    return this.getBaseConf().get('server');
};

/**
 * Returns the server port (the application will be reachable under this port) of the server config.
 * **/
conf.prototype.getServerPort = function () {
    return this.getServerConf().get('port');
};

/**
 * Returns the amount of milliseconds after which a request should timeout.
 * **/
conf.prototype.getRequestTimeout = function () {
    return this.getServerConf().get('timeoutInMs');
};

/**
 * Returns the image configuration.
 * **/
conf.prototype.getImagesConfig = function () {
    return this.getBaseConf().get('images');
};

/**
 * Returns the folder path in which the reference images are stored.
 * **/
conf.prototype.getReferenceImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('referenceImageFolder'));
};

/**
 * Returns the folder path in which the new images are stored.
 * **/
conf.prototype.getNewImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('newImageFolder'));
};

/**
 * Returns the folder path in which the diff images will be stored.
 * **/
conf.prototype.getResultImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('resultImageFolder'));
};

/**
 * Returns the file path in which the meta information for the images will be stored.
 * **/
conf.prototype.getMetaInformationFilePath = function () {
    return path.normalize(this.getImagesConfig().get('metaInformationFile'));
};

/**
 * Returns the threshold configuration.
 * **/
conf.prototype.getThresholdConf = function () {
    return this.getBaseConf().get('thresholds');
};

/**
 * Returns the maximum allowed percentual pixel difference before the images will be added to the result set.
 * **/
conf.prototype.getMaxPixelDifferenceThreshold = function () {
    return this.getThresholdConf().get('maxPercentualImagePixelDifference');
};

/**
 * Returns the maximum allowed hammond distance before the images will be added to the result set.
 * **/
conf.prototype.getMaxDistanceDifferenceThreshold = function () {
    return this.getThresholdConf().get('maxImageImageDistanceDifference');
};

/**
 * Returns the option configuration.
 * **/
conf.prototype.getOptions = function () {
    return this.getBaseConf().get('options');
};

/**
 * Returns if the images should be auto cropped before they are compared.
 * **/
conf.prototype.getAutoCropOption = function () {
    return this.getOptions().get('autoCrop');
};

module.exports = new conf();