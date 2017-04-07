/**
 * Represents an ignore area.
 *
 * @constructor
 * **/
var IgnoreArea = function () {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.height = 0;
    this.width = 0;
    this.id = -1;
};

/**
 * Returns the x value where the area starts.
 *
 * @return {Number} Returns the x value where the area starts.
 * **/
IgnoreArea.prototype.getX = function () {
  return this.x;
};

/**
 * Returns the y value where the area starts.
 *
 * @return {Number} Returns the y value where the area starts.
 * **/
IgnoreArea.prototype.getY = function () {
    return this.y;
};

/**
 * Returns the z value.
 *
 * @return {Number} Returns the z value.
 * **/
IgnoreArea.prototype.getZ = function () {
    return this.z;
};

/**
 * Returns the height.
 *
 * @return {Number} Returns the height.
 * **/
IgnoreArea.prototype.getHeight = function () {
    return this.height;
};

/**
 * Returns the width.
 *
 * @return {Number} Returns the width.
 * **/
IgnoreArea.prototype.getWidth = function () {
    return this.width;
};

/**
 * Returns the id of this ignore area.
 *
 * @return {String} Returns the id of this ignore area.
 * **/
IgnoreArea.prototype.getId = function () {
    return this.id;
};

/**
 * Sets the x value.
 *
 * @param {Number} x Sets the x value.
 * **/
IgnoreArea.prototype.setX = function (x) {
  this.x = x;
};

/**
 * Sets the y value.
 *
 * @param {Number} y Sets the y value.
 * **/
IgnoreArea.prototype.setY = function (y) {
    this.y = y;
};

/**
 * Sets the z value.
 *
 * @param {Number} z Sets the z value.
 * **/
IgnoreArea.prototype.setZ = function (z) {
    this.z = z;
};

/**
 * Sets the height.
 *
 * @param {Number} height Sets the height.
 * **/
IgnoreArea.prototype.setHeight = function (height) {
    this.height = height;
};

/**
 * Sets the width.
 *
 * @param {Number} width Sets the width.
 * **/
IgnoreArea.prototype.setWidth = function (width) {
    this.width = width;
};

/**
 * Sets the id.
 *
 * @param {Number} id Sets the id.
 * **/
IgnoreArea.prototype.setId = function (id) {
    this.id = id;
};

/**
 * Loads the data from an object.
 *
 * @param {Object} ignoreAreaData The objects containing the data. The objects structure must be identical to this prototype.
 * **/
IgnoreArea.prototype.load = function (ignoreAreaData) {
    this.x = ignoreAreaData.x;
    this.y = ignoreAreaData.y;
    this.z = ignoreAreaData.z;
    this.height = ignoreAreaData.height;
    this.width = ignoreAreaData.width;
    this.id = ignoreAreaData.id;
};

module.exports = IgnoreArea;