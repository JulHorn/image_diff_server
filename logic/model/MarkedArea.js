/**
 * The constructor.
 *
 * @param x The start x value. Optional.
 * @param y The start y value. Optional.
 * @param z The start z value. Optional.
 * @param height The height (y axes). Optional.
 * @param width The width (x axes). Optional.
 * @constructor
 */
var MarkedArea = function (x, y, z, height, width) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.height = height || 0;
    this.width = width|| 0;
    this.id = -1;
};

/**
 * Returns the x value where the area starts.
 *
 * @return {Number} Returns the x value where the area starts.
 * **/
MarkedArea.prototype.getX = function () {
  return this.x;
};

/**
 * Returns the y value where the area starts.
 *
 * @return {Number} Returns the y value where the area starts.
 * **/
MarkedArea.prototype.getY = function () {
    return this.y;
};

/**
 * Returns the z value.
 *
 * @return {Number} Returns the z value.
 * **/
MarkedArea.prototype.getZ = function () {
    return this.z;
};

/**
 * Returns the height.
 *
 * @return {Number} Returns the height.
 * **/
MarkedArea.prototype.getHeight = function () {
    return this.height;
};

/**
 * Returns the width.
 *
 * @return {Number} Returns the width.
 * **/
MarkedArea.prototype.getWidth = function () {
    return this.width;
};

/**
 * Returns the id of this ignore area.
 *
 * @return {String} Returns the id of this ignore area.
 * **/
MarkedArea.prototype.getId = function () {
    return this.id;
};

/**
 * Sets the x value.
 *
 * @param {Number} x Sets the x value.
 * **/
MarkedArea.prototype.setX = function (x) {
  this.x = x;
};

/**
 * Sets the y value.
 *
 * @param {Number} y Sets the y value.
 * **/
MarkedArea.prototype.setY = function (y) {
    this.y = y;
};

/**
 * Sets the z value.
 *
 * @param {Number} z Sets the z value.
 * **/
MarkedArea.prototype.setZ = function (z) {
    this.z = z;
};

/**
 * Sets the height.
 *
 * @param {Number} height Sets the height.
 * **/
MarkedArea.prototype.setHeight = function (height) {
    this.height = height;
};

/**
 * Sets the width.
 *
 * @param {Number} width Sets the width.
 * **/
MarkedArea.prototype.setWidth = function (width) {
    this.width = width;
};

/**
 * Sets the id.
 *
 * @param {Number} id Sets the id.
 * **/
MarkedArea.prototype.setId = function (id) {
    this.id = id;
};

/**
 * Determines whether given coordinates are within the marked area.
 * @param x The x-coordinate which should be checked.
 * @param y The y-coordinate which should be checked.
 * @return {boolean} True if the given coordinates are within the marked area, else false.
 */
MarkedArea.prototype.contains = function(x, y) {
	return x >= this.getX() &&
		   x <= this.getX() + this.getWidth() &&
		   y >= this.getY() &&
		   y <= this.getY() + this.getHeight();
};

/**
 * Loads the data from an object.
 *
 * @param {Object} markedAreaData The objects containing the data. The objects structure must be identical to this prototype.
 * **/
MarkedArea.prototype.load = function (markedAreaData) {
    this.x = markedAreaData.x;
    this.y = markedAreaData.y;
    this.z = markedAreaData.z;
    this.height = markedAreaData.height;
    this.width = markedAreaData.width;
    this.id = markedAreaData.id;
};

module.exports = MarkedArea;