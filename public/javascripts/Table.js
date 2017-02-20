/**
 * Offers logic to handle the table.
 *
 * @param connector The object to send requests to the server
 * @param callback Called when the UI needs an update.
 * **/
var Table = function (connector, callback) {
    this.callback = callback;
    this.connector = connector;
    this.$container = $('#table');

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
        var button = this;

        that.connector.delete($(this).data('id'), function (data) {
            // Do not draw everything new because the usability suffers if there are a lot of images
            //that.callback(data);
            $(button).closest('tr').remove();
        });
    });

    // Bind add new image to reference imageaction to add button
    this.$container.on('click', 'button[data-action=add]', function () {
        var informationLabel = $(this).next('label');
        var button = $(this);
        var id = $(this).data('id');
        that.connector.makteToNewReferenceImage(id, function (data) {
            // Modify only the row where the action was triggered
            var resultImageSet = that.__getImageSetById(id, data.imageMetaInformationModel);

            informationLabel.text('New reference image');
            that.__updateImageSetMetaInformation(resultImageSet, button.parents('tr'));

            // Do not draw everything new because the usability suffers if there are a lot of images
            // that.callback(data);
        });
    });
};

/**
 * Draws the table and its content.
 *
* @param data Contains all information about the run job.
* **/
Table.prototype.draw = function (data) {
    var $contentTableBody = this.$container.find('tbody');
    var that = this;

    $contentTableBody.empty();

    data.imageMetaInformationModel.imageSets.forEach(function (imageSet) {
        var rowContent = '';

        rowContent += '<td role="referenceImage">';
        rowContent += that.__createDefaultCellContent(imageSet.referenceImage);
        rowContent += '<button data-id="' + imageSet.id + '" data-action="delete">Delete</button>';
        rowContent += '</td>';

        rowContent += '<td role="newImage">';
        rowContent += that.__createDefaultCellContent(imageSet.newImage);
        rowContent += '<button data-id="' + imageSet.id + '" data-action="add">New Reference</button>';
        rowContent += '</td>';

        rowContent += '<td role="diffImage">';
        rowContent += that.__createDefaultCellContent(imageSet.diffImage);
        rowContent += '<span>Percentual difference:</span>';
        rowContent += '<span role="percPixelDifference">' + imageSet.difference + '</span><br>';
        rowContent += '<span>Distance:</span>';
        rowContent += '<span role="distanceDifference">' + imageSet.distance + '</span><br>';
        rowContent += '<span>Error:</span>';
        rowContent += '<span role="error">' + imageSet.error + '</span><br>';
        rowContent += '</td>';

        $contentTableBody.append($('<tr>' + rowContent + '</tr>>'));
    });
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
 * Creates the default content of a cell (image with link, basic information).
 *
 * @return The created cell content.
 * **/
Table.prototype.__createDefaultCellContent = function (image) {
    var cellContent = '';
    // Ensure that images will be reloaded
    var imageSuffix = '?timestamp=' + new Date().getTime();

    cellContent += '<a href="' + image.path.replace('public', '.') + imageSuffix + '" role="imageLink">';
    cellContent += '<img src="' + image.path.replace('public', '.') + imageSuffix + '" role="image"/>';
    cellContent += '</a>';

    cellContent += '<div>';
    cellContent += '<span>Name:</span>';
    cellContent += '<span role="imageName">' + image.name + '</span><br>';
    cellContent += '<span>Height:</span>';
    cellContent += '<span role="height">' + image.height + 'px</span><br>';
    cellContent += '<span>Width:</span>';
    cellContent += '<span role="width">' + image.width + 'px</span><br>';
    cellContent += '</div>';

    return cellContent;
};

/**
 * Updates the image information/imageMetaInformationModel information.
 *
 * @param resultImageSet The image set with the new information.
 * @param parentElement The parent element under which the images etc. are located. Pretty much a row.
 * **/
Table.prototype.__updateImageSetMetaInformation = function (resultImageSet, parentElement) {
    var refImg = parentElement.find('td[role="referenceImage"]');
    // var newImg = parentElement.find('td[role="newImage"]');
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