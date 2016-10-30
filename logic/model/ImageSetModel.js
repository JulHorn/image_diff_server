var uuid = require('node-uuid');
var ImageModel = require('./ImageModel');

var ImageSetModel = function () {
    this.difference = 0;
    this.distance = 0;
    this.error = '';
    this.id = uuid.v1();
    this.referenceImage = new ImageModel();
    this.newImage = new ImageModel();
    this.diffImage = new ImageModel();
};

/* ----- Getter ----- */

ImageSetModel.prototype.getDifference = function () {
    return this.difference;
};

ImageSetModel.prototype.getDistance = function () {
    return this.distance;
};

ImageSetModel.prototype.getError = function () {
    return this.error;
};

ImageSetModel.prototype.getId = function () {
    return this.id;
};

ImageSetModel.prototype.getReferenceImage = function () {
    return this.referenceImage;
};

ImageSetModel.prototype.getNewImage = function () {
    return this.newImage;
};

ImageSetModel.prototype.getDiffImage = function () {
    return this.diffImage;
};

/* ----- Setter ----- */

ImageSetModel.prototype.setDifference = function (difference) {
    this.difference = difference;
};

ImageSetModel.prototype.setDistance = function (distance) {
    this.distance = distance;
};

ImageSetModel.prototype.setError = function (error) {
    this.error = error;
};

ImageSetModel.prototype.setReferenceImage = function (image) {
    this.referenceImage = image;
};

ImageSetModel.prototype.setNewImage = function (image) {
    this.newImage = image;
};

ImageSetModel.prototype.setDiffImage = function (image) {
    this.diffImage = image;
};

/* ----- Other ----- */

ImageSetModel.prototype.load = function (data) {
    this.setDistance(data.distance);
    this.setDifference(data.difference);
    this.setError(data.error);
    this.id = data.id;

    this.getReferenceImage().load(data.referenceImage);
    this.getNewImage().load(data.newImage);
    this.getDiffImage().load(data.diffImage);
};

module.exports = ImageSetModel;