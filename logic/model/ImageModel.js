var ImageModel = function () {
    this.height = 0;
    this.width = 0;
    this.name = '';
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

module.exports = ImageModel;