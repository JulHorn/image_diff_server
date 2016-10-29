var ImageMetaInformationModel = function () {
    this.biggestDifference = 0;
    this.timeStamp = '';
    this.imageSets = [];
};

ImageMetaInformationModel.prototype.setTimeStamp = function (timestamp) {
    this.timeStamp = timestamp;
};

ImageMetaInformationModel.prototype.getTimeStamp = function () {
    return this.timeStamp;
};

ImageMetaInformationModel.prototype.getBiggestDifference = function () {
    return this.biggestDifference;
};

ImageMetaInformationModel.prototype.save = function () {

};

ImageMetaInformationModel.prototype.save = function () {

};

ImageMetaInformationModel.prototype.getImageSets = function(){
    return this.imageSets;
};

ImageMetaInformationModel.prototype.addImageSet = function (imageSet) {
    this.imageSets.push(imageSet);
};

ImageMetaInformationModel.prototype.addImageSets = function (imageSets) {
    this.imageSets = this.imageSets.concat(imageSets);
};

ImageMetaInformationModel.prototype.calculateBiggestDifference = function () {
    var that = this;

    this.imageSets.forEach(function (set) {
        if(that.biggestDifference < set.getDifference()){
            that.biggestDifference = set.getDifference();
        }
    });
};

ImageMetaInformationModel.prototype.getImageSetById = function(id){

};

ImageMetaInformationModel.prototype.getImageSetByName = function(id){

};

module.exports = ImageMetaInformationModel;