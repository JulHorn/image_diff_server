/**
 * Constructor.
 * **/
var ImageDiffGUILogic = function () {
    this.bindEvents();
    this.connector = new Connector();

    // Get the server endpoint to which the requests will be send and display it in the textfield
    $('#serverAddress').val(this.connector.getServerEndpoint());
};

/* ----- Methods ----- */

/**
 * Binds the eventhandler to the ui elements.
 * **/
ImageDiffGUILogic.prototype.bindEvents = function () {
    var that = this;

    // Bind delete action to delete buttons
    $('table').on('click', 'button[data-action=delete]', function () {
        that.connector.delete($(this).data('id'), function (data) {
            that.__refreshMetaInformation(data);
        });
        $(this).parents('tr').remove();
    });

    // Bind add new image to reference imageaction to add button
    $('table').on('click', 'button[data-action=add]', function () {
        var informationLabel = $(this).next('label');
        var button = $(this);
        var id = $(this).data('id');
        that.connector.makteToNewReferenceImage(id, function (data) {
            var resultImageSet = that.__getImageSetById(id, data);
            informationLabel.text('New reference image');
            that.__refreshMetaInformation(data);
            that.__updateImageSetMetaInformation(resultImageSet, button.parents('tr'));
        });
    });

    // Bind save server endpoint to save button
    $('body').on('click', 'button[data-action=saveServerAddress]', function () {
        localStorage.imageDiffServerEndpoint = $('#serverAddress').val();
    });

    // Bind calculate all diff images to the corresponding button
    $('body').on('click', 'button[data-action=refreshAll]', function () {
        that.connector.refreshAll(function () {
            $('#refreshAllText').text('Started to recalculate all image differences. This might take a while.');
        });
    });
};

/* ----- Helper Methods ----- */

/**
 * Updates the image information/meta information.
 *
 * @param resultImageSet The image set with the new information.
 * @param parentElement The parent element under which the images etc. are located. Pretty much a row.
 * **/
ImageDiffGUILogic.prototype.__updateImageSetMetaInformation = function (resultImageSet, parentElement) {
    var refImg = parentElement.find('td[role="referenceImage"]');
    var newImg = parentElement.find('td[role="newImage"]');
    var diffImg = parentElement.find('td[role="diffImage"]');
    var imageSuffix = '?timestamp=' + new Date().getTime();

    // Set new images after a short delay because the new image might not be written yet otherwise
    window.setTimeout(function () {
        diffImg.find('a[role="imageLink"]').attr('href', resultImageSet.diffImage.path.replace('public', '.') + imageSuffix);
        diffImg.find('img[role="image"]').attr('src', resultImageSet.diffImage.path.replace('public', '.') + imageSuffix);
        refImg.find('a[role="imageLink"]').attr('href', resultImageSet.referenceImage.path.replace('public', '.') + imageSuffix);
        refImg.find('img[role="image"]').attr('src', resultImageSet.referenceImage.path.replace('public', '.') + imageSuffix);
    }, 200);

    // Set meta information
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

/**
 * Returns an ImageModelSet.
 *
 * @param id The id of the image set which should be retrieved.
 * @param imageMetaModel The image information meta in which the sets are located.
 * @return The found image set.
 * **/
ImageDiffGUILogic.prototype.__getImageSetById = function (id, imageMetaModel) {
    return imageMetaModel.imageSets.filter(function (imageSet) {
       return imageSet.id === id;
    })[0];
};

/**
 * Refreshes the global meta information like biggest difference in the ui.
 *
 * @param imageMetaModel The model which contains the information to be refreshed.
 * **/
ImageDiffGUILogic.prototype.__refreshMetaInformation = function (imageMetaModel) {
    $('#timeStamp').text(imageMetaModel.timeStamp);
    $('#numberOfSets').text(imageMetaModel.imageSets.length);
    $('#maxPixelPercentage').text(imageMetaModel.biggestPercentualPixelDifference);
    $('#maxDistance').text(imageMetaModel.biggestDistanceDifference);
};
