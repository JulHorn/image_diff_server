/**
 * @param callback Called when the UI needs an update.
 * **/
var Table = function (connector, callback) {
    this.callback = callback;
    this.connector = connector;
    this.$container = $('table');

    this.bindEvents();
};

/* ----- Methods ----- */

/**
 * Binds the eventhandler to the ui elements.
 * **/
Table.prototype.bindEvents = function () {
    var that = this;

    // Bind delete action to delete buttons
    this.$container.on('click', 'button[data-action=delete]', function () {
        that.connector.delete($(this).data('id'), function (data) {

        });
        $(this).parents('tr').remove();
    });

    // Bind add new image to reference imageaction to add button
    this.$container.on('click', 'button[data-action=add]', function () {
        var informationLabel = $(this).next('label');
        var button = $(this);
        var id = $(this).data('id');
        that.connector.makteToNewReferenceImage(id, function (data) {
            var resultImageSet = that.__getImageSetById(id, data);
            informationLabel.text('New reference image');

            that.__updateImageSetMetaInformation(resultImageSet, button.parents('tr'));
        });
    });
};

/**
* @param data Contains all information about the run job.
* **/
Table.prototype.draw = function (data) {

};

/**
 * Returns an ImageModelSet.
 *
 * @param id The id of the image set which should be retrieved.
 * @param imageMetaModel The image information imageMetaInformationModel in which the sets are located.
 * @return The found image set.
 * **/
Table.prototype.__getImageSetById = function (id, imageMetaModel) {
    return imageMetaModel.imageSets.filter(function (imageSet) {
        return imageSet.id === id;
    })[0];
};

/**
 * Updates the image information/imageMetaInformationModel information.
 *
 * @param resultImageSet The image set with the new information.
 * @param parentElement The parent element under which the images etc. are located. Pretty much a row.
 * **/
Table.prototype.__updateImageSetMetaInformation = function (resultImageSet, parentElement) {
    var refImg = parentElement.find('td[role="referenceImage"]');
    var newImg = parentElement.find('td[role="newImage"]');
    var diffImg = parentElement.find('td[role="diffImage"]');
    var imageSuffix = '?timestamp=' + new Date().getTime();

    // Set new images
    diffImg.find('a[role="imageLink"]').attr('href', resultImageSet.diffImage.path.replace('public', '.') + imageSuffix);
    diffImg.find('img[role="image"]').attr('src', resultImageSet.diffImage.path.replace('public', '.') + imageSuffix);
    refImg.find('a[role="imageLink"]').attr('href', resultImageSet.referenceImage.path.replace('public', '.') + imageSuffix);
    refImg.find('img[role="image"]').attr('src', resultImageSet.referenceImage.path.replace('public', '.') + imageSuffix);

    // Set imageMetaInformationModel information
    refImg.find('*[role="imageName"]').text(resultImageSet.referenceImage.name);
    diffImg.find('*[role="imageName"]').text(resultImageSet.diffImage.name);
    refImg.find('*[role="height"]').text(resultImageSet.referenceImage.height);
    diffImg.find('*[role="height"]').text(resultImageSet.referenceImage.height);
    refImg.find('*[role="width"]').text(resultImageSet.referenceImage.width);
    diffImg.find('*[role="width"]').text(resultImageSet.referenceImage.width);
    diffImg.find('*[role="error"]').text(resultImageSet.error);
    diffImg.find('*[role="percPixelDifference"]').text(resultImageSet.difference);
    diffImg.find('*[role="distanceDifference"]').text(resultImageSet.distance);
};