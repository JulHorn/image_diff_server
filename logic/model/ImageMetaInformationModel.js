var ImageMetaInformationModel = function () {
    this.biggestDifference = 0;
    this.timeStamp = '';
    this.imageSets = [];
};

ImageMetaInformationModel.prototype.save = function () {

};

ImageMetaInformationModel.prototype.save = function () {

};

ImageMetaInformationModel.prototype.addImageSet = function (imageSet) {
    this.imageSets.push(imageSet);
};

ImageMetaInformationModel.prototype.addImageSets = function (imageSets) {
    this.imageSets = this.imageSets.concat(imageSets);
};

ImageMetaInformationModel.prototype.getImageSetById = function(id){

};

ImageMetaInformationModel.prototype.getImageSetByName = function(id){

};

module.exports = ImageMetaInformationModel;