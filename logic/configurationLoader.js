var config = require('config');
var path = require('path');

var conf = function () {
    
};

conf.prototype.getBaseConf = function () {
    return config;
};

conf.prototype.getServerConf = function () {
    return this.getBaseConf().get('server');
};

conf.prototype.getServerPort = function () {
    return this.getServerConf().get('port');
};

conf.prototype.getImagesConfig = function () {
    return this.getBaseConf().get('images');
};

conf.prototype.getReferenceImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('referenceImageFolder'));
};

conf.prototype.getNewImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('newImageFolder'));
};

conf.prototype.getResultImageFolderPath = function () {
    return path.normalize(this.getImagesConfig().get('resultImageFolder'));
};

conf.prototype.getMetaInformationFilePath = function () {
    return path.normalize(this.getImagesConfig().get('metaInformationFile'));
};

conf.prototype.getThresholdConf = function () {
    return this.getBaseConf().get('thresholds');
};

conf.prototype.getMaxPixelDifferenceThreshold = function () {
    return this.getThresholdConf().get('maxPercentualImagePixelDifference');
};

conf.prototype.getMaxDistanceDifferenceThreshold = function () {
    return this.getThresholdConf().get('maxImageImageDistanceDifference');
};

module.exports = new conf();