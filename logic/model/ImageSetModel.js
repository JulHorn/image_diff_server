var uuid = require('node-uuid');
var ImageModel = require('./ImageModel');
var IgnoreArea = require('./IgnoreArea');

/**
 * Constructor. Adds empty ImageModel objects as its reference, new and diff images.
 * **/
var ImageSetModel = function () {
    this.difference = 0;
    this.distance = 0;
    this.error = '';
    this.id = uuid.v1();
    this.referenceImage = new ImageModel();
    this.newImage = new ImageModel();
    this.diffImage = new ImageModel();
    this.ignoreAreas = [];
};

/* ----- Getter ----- */

/**
 * Returns the percentual pixel difference of the reference and new image.
 *
 * @return Returns the percentual pixel difference of the reference and new image.
 * **/
ImageSetModel.prototype.getDifference = function () {
    return this.difference;
};

/**
 * Returns the distance of the reference and new image.
 *
 * @return Returns the distance difference of the reference and new image.
 * **/
ImageSetModel.prototype.getDistance = function () {
    return this.distance;
};

/**
 * Returns the error text.
 *
 * @return Returns the error text.
 * **/
ImageSetModel.prototype.getError = function () {
    return this.error;
};

/**
 * Returns the id.
 *
 * @return Returns the id.
 * **/
ImageSetModel.prototype.getId = function () {
    return this.id;
};

/**
 * Returns the reference image.
 *
 * @return Returns the reference image.
 * **/
ImageSetModel.prototype.getReferenceImage = function () {
    return this.referenceImage;
};

/**
 * Returns the new image.
 *
 * @return Returns the new image.
 * **/
ImageSetModel.prototype.getNewImage = function () {
    return this.newImage;
};

/**
 * Returns the diff image.
 *
 * @return Returns the diff image.
 * **/
ImageSetModel.prototype.getDiffImage = function () {
    return this.diffImage;
};

ImageSetModel.prototype.getIgnoreAreas = function () {
    return this.ignoreAreas;
};

/* ----- Setter ----- */

/**
 * Sets the percentual pixel difference between the reference and new image.
 *
 * @param difference The difference between the reference and new image.
 * **/
ImageSetModel.prototype.setDifference = function (difference) {
    this.difference = difference;
};

/**
 * Sets the distance between the reference and new image.
 *
 * @param distance The distance between the reference and new image.
 * **/
ImageSetModel.prototype.setDistance = function (distance) {
    this.distance = distance;
};

/**
 * Sets the error reason.
 *
 * @param error The error reason.
 * **/
ImageSetModel.prototype.setError = function (error) {
    this.error = error;
};

/**
 * Sets the reference image.
 *
 * @param image The reference image.
 * **/
ImageSetModel.prototype.setReferenceImage = function (image) {
    this.referenceImage = image;
};

/**
 * Sets the new image.
 *
 * @param image The new image.
 * **/
ImageSetModel.prototype.setNewImage = function (image) {
    this.newImage = image;
};

/**
 * Sets the diff image.
 *
 * @param image The diff image.
 * **/
ImageSetModel.prototype.setDiffImage = function (image) {
    this.diffImage = image;
};

ImageSetModel.prototype.setIgnoreAreas = function (ignoreAreas) {
  this.ignoreAreas = ignoreAreas;
};

/* ----- Other ----- */

/**
 * Loads the given data with an image set structure into this image set.
 *
 * @param data The object containing the image set data. Must have the structure of this image set object.
 * **/
ImageSetModel.prototype.load = function (data) {
    var that = this;

    this.setDistance(data.distance);
    this.setDifference(data.difference);
    this.setError(data.error);
    this.id = data.id;

    this.getReferenceImage().load(data.referenceImage);
    this.getNewImage().load(data.newImage);
    this.getDiffImage().load(data.diffImage);

    if(data.ignoreAreas) {
        data.ignoreAreas.forEach(function (ignoreAreaData) {
            var newIgnoreArea = new IgnoreArea();

            newIgnoreArea.load(ignoreAreaData);
            that.ignoreAreas.push(newIgnoreArea);
        });
    }
};

module.exports = ImageSetModel;