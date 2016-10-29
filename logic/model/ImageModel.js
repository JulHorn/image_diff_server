var ImageModel = function () {
    this.height = 0;
    this.width = 0;
    this.name = '';
    this.path = '';
};

/* ----- Getter ----- */

ImageModel.prototype.getHeight = function () {
    return this.height;
};

ImageModel.prototype.getWidth = function () {
    return this.width;
};

ImageModel.prototype.getName = function () {
    return this.name;
};

ImageModel.prototype.getPath = function () {
    return this.path;
};

/* ----- Setter ----- */

ImageModel.prototype.setHeight = function (height) {
    this.height = height;
};

ImageModel.prototype.setWidth = function (width) {
    this.width = width;
};

ImageModel.prototype.setName = function (name) {
    this.name = name;
};

ImageModel.prototype.setPath = function (path) {
    this.path = path;
};

module.exports = ImageModel;