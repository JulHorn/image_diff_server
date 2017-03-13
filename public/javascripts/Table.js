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
        var $rowWhichIsBeingEdited = $(this).closest('tr');
        var button = this;

        that.__enableLoadingIconForRow($rowWhichIsBeingEdited);

        that.connector.delete($(this).data('id'), function (data) {
            // Draw all other components but the table because there could be some bad performance with a lot of images
            that.callback(data, that);
            // Remove the row manually for a better user experience
            $(button).closest('tr').remove();
        });
    });

    // Bind add new image to reference imageaction to add button
    this.$container.on('click', 'button[data-action=add]', function () {
        var $rowWhichIsBeingEdited = $(this).closest('tr');
        var informationLabel = $(this).next('label');
        var button = $(this);
        var id = $(this).data('id');

        that.__enableLoadingIconForRow($rowWhichIsBeingEdited);

        that.connector.makteToNewReferenceImage(id, function (data) {
            // Modify only the row where the action was triggered
            var resultImageSet = that.__getImageSetById(id, data.imageMetaInformationModel);

            informationLabel.text('New reference image');
            // Draw all other components but the table because there could be some bad performance with a lot of images
            that.callback(data, that);
            // Update the row manually for a better user experience
            that.__updateImageSetMetaInformation(resultImageSet, button.parents('tr'));
            that.__disableLoadingIconForRow($rowWhichIsBeingEdited);
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
        rowContent += that.__createAjaxLoadingIcon();
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

        $contentTableBody.append($('<tr>' + rowContent + '</tr>'));
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
    // Add element to be able to disable editing of the row while a corresponding aax process is still in progress
    cellContent += '<div class="grayOut hide" role="backgroundBlocker"/>';

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

/**
 * Creates an ajax loading icon element.
 *
 * @return string A loading icon div element.
 * **/
Table.prototype.__createAjaxLoadingIcon = function () {
    return '<div class="sk-circle ajaxLoadingIconAdditionalStyles hide" role ="ajaxLoadingIcon">'
        + '<div class="sk-circle1 sk-child"></div>'
        + '<div class="sk-circle2 sk-child"></div>'
        + '<div class="sk-circle3 sk-child"></div>'
        + '<div class="sk-circle4 sk-child"></div>'
        + '<div class="sk-circle5 sk-child"></div>'
        + '<div class="sk-circle6 sk-child"></div>'
        + '<div class="sk-circle7 sk-child"></div>'
        + '<div class="sk-circle8 sk-child"></div>'
        + '<div class="sk-circle9 sk-child"></div>'
        + '<div class="sk-circle10 sk-child"></div>'
        + '<div class="sk-circle11 sk-child"></div>'
        + '<div class="sk-circle12 sk-child"></div>'
        + '</div>';
};

/**
 * Enables the ajax loading icon for the row. The background for the row will be made unclickable.
 *
 * @param rowElement The jQuery row element.
 * **/
Table.prototype.__enableLoadingIconForRow = function (rowElement) {
    // Enable background blocker
    rowElement.find('div[role="backgroundBlocker"]').each(function () {
        $(this).removeClass("hide");
    });

    // Display loading icon
    rowElement.find('div[role="ajaxLoadingIcon"]').removeClass("hide");
};

/**
 * Disabled the ajax loading icon for the row.
 *
 * @param rowElement The jQuery row element.
 * **/
Table.prototype.__disableLoadingIconForRow = function (rowElement) {
    // Hide background blocker
    rowElement.find('div[role="backgroundBlocker"]').each(function () {
        $(this).addClass("hide");
    });

    // Hide loading icon
    rowElement.find('div[role="ajaxLoadingIcon"]').addClass("hide");
};