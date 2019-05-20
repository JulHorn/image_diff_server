var config = require('config');
var path = require('path');

/**
 * Constructor.
 *
 * @constructor
 * **/
var Configuration = function () {
    
};

/* ----- Methods ----- */

/**
 * Returns the base config.
 *
 * @return {Object} Returns the base conf.
 * **/
Configuration.prototype.getBaseConf = function () {
    return config;
};

/**
 * Returns the server config.
 *
 * @return {Object} Returns the server config.
 * **/
Configuration.prototype.getServerConf = function () {
    return this.getBaseConf().get('server');
};

/**
 * Returns the server port (the application will be reachable under this port) of the server config.
 *
 * @return {Number} Returns the server port (the application will be reachable under this port) of the server config.
 * **/
Configuration.prototype.getServerPort = function () {
    return this.getServerConf().get('port');
};

/**
 * Returns the amount of milliseconds after which a request should timeout.
 *
 * @return {Number} Returns the amount of milliseconds after which a request should timeout.
 * **/
Configuration.prototype.getRequestTimeout = function () {
    return this.getServerConf().get('timeoutInMs');
};

/**
 * Returns the working mode. Currently 0 = "discard" or 1 = "queue".
 *
 * @return {Number} Returns the working mode. Currently 0 = "discard" or 1 = "queue".
 * **/
Configuration.prototype.getWorkingMode = function () {
    return this.getServerConf().get('workingMode');
};

/**
 * Returns the the maximum number of jobs the server will track until it will start to discard the oldest ones.
 *
 * @return {Number} Returns the the maximum number of jobs the server will track until it will start to discard the oldest ones.
 * **/
Configuration.prototype.getMaxNumberIfStoredJobs = function () {
    return this.getServerConf().get('maxNumberOfStoredJobs');
};

/**
 * Returns the the maximum allowed size in MB which is allowed for an imaged send via API.
 *
 * @return {Number} Returns the the maximum allowed size in MB which is allowed for an imaged send via API.
 * **/
Configuration.prototype.getMaxAllowedImageSizeForAPI = function () {
	return this.getServerConf().get('maxImageSize').trim();
};

/**
 * Returns the image config.
 * @return {Object} Returns the image config.
 * **/
Configuration.prototype.getImagesConfig = function () {
    return this.getBaseConf().get('images');
};

/**
 * Returns the folder path in which the reference images are stored.
 *
 * @return {String} Returns the folder path in which the reference images are stored.
 * **/
Configuration.prototype.getReferenceImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('referenceImageFolder'));
};

/**
 * Returns the folder path in which the new images are stored.
 *
 * @return {String} Returns the folder path in which the new images are stored.
 * **/
Configuration.prototype.getNewImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('newImageFolder'));
};

/**
 * Returns the folder path in which the diff images will be stored.
 *
 * @return {String} Returns the folder path in which the diff images will be stored.
 * **/
Configuration.prototype.getResultImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('resultImageFolder'));
};

/**
 * Returns the file path in which the job history file path.
 *
 * @return {String} Returns the file path in which the job history file path.
 * **/
Configuration.prototype.getJobHistoryFilePath = function () {
    return path.normalize(this.getDataFolderPath() + path.sep + 'jobHistory.json');
};

/**
 * Returns the folder path in which the data files will be stored.
 *
 * @return {String} Returns the folder path in which the data files will be stored.
 * **/
Configuration.prototype.getDataFolderPath = function () {
    return this.getImagesConfig().get('dataFolderPath');
};

/**
 * Returns the threshold config.
 *
 * @return {Object} Returns the threshold config.
 * **/
Configuration.prototype.getThresholdConf = function () {
    return this.getBaseConf().get('thresholds');
};

/**
 * Returns the maximum allowed percentual pixel difference before the images will be added to the result set.
 *
 * @return {Number} Returns the maximum allowed percentual pixel difference before the images will be added to the result set.
 * **/
Configuration.prototype.getMaxPixelDifferenceThreshold = function () {
    return this.getThresholdConf().get('maxPercentualImagePixelDifference');
};

/**
 * Returns the maximum allowed hammond distance before the images will be added to the result set.
 *
 * @return {Number} Returns the maximum allowed hamming distance before the images will be added to the result set.
 * **/
Configuration.prototype.getMaxDistanceDifferenceThreshold = function () {
    return this.getThresholdConf().get('maxImageImageDistanceDifference');
};

/**
 * Returns the option config.
 *
 * @return {Object} Returns the option config.
 * **/
Configuration.prototype.getOptions = function () {
    return this.getBaseConf().get('options');
};

/**
 * Returns if the images should be auto cropped before they are compared.
 *
 * @return {Boolean} Returns if the images should be auto cropped before they are compared.
 * **/
Configuration.prototype.getAutoCropOption = function () {
    return this.getOptions().get('autoCrop');
};

/**
 * Returns if the bounding boxes of marked areas should be displayed .
 *
 * @return {Boolean} Returns if the images should be auto cropped before they are compared.
 * **/
Configuration.prototype.getDisplayMarkedAreasOption = function () {
	return this.getOptions().get('displayMarkedAreas');
};

module.exports = new Configuration();