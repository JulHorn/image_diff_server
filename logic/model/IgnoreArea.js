var IgnoreArea = function () {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.height = 0;
    this.width = 0;
    this.id = -1;
};

IgnoreArea.prototype.getX = function () {
  return this.x;
};

IgnoreArea.prototype.getY = function () {
    return this.y;
};

IgnoreArea.prototype.getZ = function () {
    return this.z;
};

IgnoreArea.prototype.getHeight = function () {
    return this.height;
};

IgnoreArea.prototype.getWidth = function () {
    return this.width;
};

IgnoreArea.prototype.getId = function () {
    return this.id;
};

IgnoreArea.prototype.setX = function (x) {
  this.x = x;
};

IgnoreArea.prototype.setY = function (Y) {
    this.y = y;
};

IgnoreArea.prototype.setZ = function (z) {
    this.z = z;
};

IgnoreArea.prototype.setHeight = function (height) {
    this.height = height;
};

IgnoreArea.prototype.setWidth = function (width) {
    this.width = width;
};

IgnoreArea.prototype.setId = function (id) {
    this.id = id;
};

IgnoreArea.prototype.load = function (ignoreAreaData) {
    this.x = ignoreAreaData.x;
    this.y = ignoreAreaData.y;
    this.z = ignoreAreaData.z;
    this.height = ignoreAreaData.height;
    this.width = ignoreAreaData.width;
    this.id = ignoreAreaData.id;
};

module.exports = IgnoreArea;