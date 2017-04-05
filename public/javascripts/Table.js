/**
 * Offers logic to handle the table.
 *
 * @param connector The object to send requests to the server
 * @param callback Called when the UI needs an update.
 * **/
var Table = function (connector, callback) {
    this.callback = callback;
    this.connector = connector;
    this.$container = $('#content');

    this.bindEvents();
};

/* ----- Methods ----- */

/**
 * Binds the event handler to the ui elements.
 * **/
Table.prototype.bindEvents = function () {
    var that = this;

    // Bind delete action to delete buttons
    this.$container.on('click', 'button[data-action=delete]', function () {
        var  $this = $(this);
        var id = $this.data('id');

        // Disables the edited row and displayes a loading icon
        that.__enableLoaderForRow(id);

        that.connector.delete($(this).data('id'), function (data) {
            // Draw all other components but the table because there could be some bad performance with a lot of images
            that.callback(data, that);

            // Remove the row manually for a better user experience
            that.$container.find('#imageSet_' + id).remove();
        });
    });

    // Open ignore region pane
    this.$container.on('click', 'button[data-action=addIgnoreRegions]', function () {
        var $this = $(this);
        var $ignoreRegion = $('#ignoreRegion');
        var id = $this.data('id');
        var imgPath = that.__sanitizeImagePaths($this.data('image'));

        that.connector.getImageSet(id, function (imageSet) {
            that.__toggleIgnoreRegionDisableState(false);

            new AddIgnoreArea($ignoreRegion, that.connector, function () {
                $('button[data-action="addIgnoreRegions"]').each(function () {
                    that.__toggleIgnoreRegionDisableState(true);
                });
            }).show(imgPath, imageSet);
        });
    });

    // Bind add new image to reference imageaction to add button
    this.$container.on('click', 'button[data-action=add]', function () {
        var $this = $(this);
        var informationLabel = $this.next('label');
        var id = $this.data('id');

        // Disables the edited row and displayes a loading icon
        that.__enableLoaderForRow(id);

        that.connector.makeToNewReferenceImage(id, function (data) {
            // Modify only the row where the action was triggered
            var resultImageSet = that.__getImageSetById(id, data.imageMetaInformationModel);

            informationLabel.text('New reference image');
            // Draw all other components but the table because there could be some bad performance with a lot of images
            that.callback(data, that);
            // Update the row manually for a better performance
            that.__updateImageSetMetaInformation(resultImageSet, id);
            that.__disableLoaderForRow(id);
        });
    });
};

/**
 * Draws the table and its content.
 *
* @param data Contains all information about the run job.
* **/
Table.prototype.draw = function (data) {
    var that = this;
    var rowColor = 'dark';
    // Create table header
    var content = '<table><thead><th>Reference</th><th>New</th><th>Diff</th></thead></table>';

    // Create one image and one description corresponding row for every image set
    data.imageMetaInformationModel.imageSets.forEach(function (imageSet) {
        // Get content for the image and description rows
        var imageRowContent = that.__createImageRow(imageSet);
        var descriptionRowContent = that.__createDescriptionRow(imageSet);

        // Add the content as new rows to the table
        content += '<div class="imageSet" id="imageSet_' + imageSet.id + '">';
        content += '<table>';
        content += '<tr id="imageRow_' + imageSet.id + '" class="imageRow ' + rowColor + '">' + imageRowContent + '</tr>';
        content += '<tr id="descriptionRow_' + imageSet.id + '" class="descriptionRow ' + rowColor + '">' + descriptionRowContent + '</tr>';
        content += '</table>';
        content += '<div class="loader">' + that.__createAjaxLoadingIcon() + '</div>';
        content += '</div>';

        // Modify color class for each row
        if(rowColor === 'light') {
            rowColor = 'dark';
        } else {
            rowColor = 'light';
        }
    });

    this.$container.html($(content));
};

/**
* Creates the content for the image row.
*
* @param imageSet The imageSet object which contains the information about the images.
* @return String The image content for a table row.
* */
Table.prototype.__createImageRow = function (imageSet) {
    var rowContent = '';

    rowContent += '<td role="referenceImage">';
    rowContent += this.__createImageCellContent(imageSet.referenceImage);
    rowContent += '</td>';

    rowContent += '<td role="newImage">';
    rowContent += this.__createImageCellContent(imageSet.newImage);

    rowContent += '</td>';

    rowContent += '<td role="diffImage">';
    rowContent += this.__createImageCellContent(imageSet.diffImage);
    rowContent += '</td>';

    return rowContent;
};

/**
* Creates the content for the description row.
*
* @param imageSet The imageSet object which contains the information about the images.
* @return String The description content for a table row.
* */
Table.prototype.__createDescriptionRow = function (imageSet) {
    var desRowContent = '';

    desRowContent += '<td role="referenceDescription" id="' + imageSet.id + '">';
    desRowContent += this.__createDefaultDescriptionCellContent(imageSet.referenceImage);
    desRowContent += '<button data-id="' + imageSet.id + '" data-action="delete">Delete</button>';
    desRowContent += '<button data-id="' + imageSet.id + '" data-image="' + imageSet.referenceImage.path +  '" data-action="addIgnoreRegions">Modify Ignore Regions</button>';
    desRowContent += '</td>';

    desRowContent += '<td role="newDescription">';
    desRowContent += this.__createDefaultDescriptionCellContent(imageSet.newImage);

    // Disable button if no image exists
    if(imageSet.newImage.path) {
        desRowContent += '<button data-id="' + imageSet.id + '" data-action="add">New Reference</button>';
    } else {
        desRowContent += '<button class="disabledButton" disabled data-id="' + imageSet.id + '" data-action="add">New Reference</button>';
    }

    desRowContent += '</td>';

    desRowContent += '<td role="diffDescription">';
    desRowContent += this.__createDefaultDescriptionCellContent(imageSet.diffImage);
    desRowContent += '<div>';
    desRowContent += '<span>Percentual difference:</span>';
    desRowContent += '<span role="percPixelDifference">' + imageSet.difference + '</span><br>';
    desRowContent += '<span>Distance:</span>';
    desRowContent += '<span role="distanceDifference">' + imageSet.distance + '</span><br>';
    desRowContent += '<span>Error:</span>';
    desRowContent += '<span role="error">' + imageSet.error + '</span><br>';
    desRowContent += '</div>';
    desRowContent += '</td>';

    return desRowContent;
};

/**
 * Creates the default description cell content.
 *
 * @param image The image object containing information about an image.
 * @return String A div which contains information about the height, width and name of an image.
 * **/
Table.prototype.__createDefaultDescriptionCellContent = function (image) {
    var cellContent = '';

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
 * @return String The created cell content.
 * **/
Table.prototype.__createImageCellContent = function (image) {
    var cellContent = '';
    // Ensure that images will be reloaded
    var imageSuffix = '?timestamp=' + new Date().getTime();
    var imageContainerClass = image.path ? '' : 'hidden';
    var noImageNoticeTextContainerClass = image.path ? 'hidden' : '';

    // Only display image if there is one, else display a notification text
    cellContent += '<a class="' + imageContainerClass + '" href="' + this.__sanitizeImagePaths(image.path) + imageSuffix + '" role="imageLink">';
    cellContent += '<img src="' + this.__sanitizeImagePaths(image.path) + imageSuffix + '" role="image">';
    cellContent += '</a>';
    cellContent += '<div class="noImageAvailableText ' + noImageNoticeTextContainerClass + '">';
    cellContent += '<span>No image to display yet</span>';
    cellContent += '</div>';

    return cellContent;
};

/**
 * Updates the image information/imageMetaInformationModel information.
 *
 * @param resultImageSet The image set with the new information.
 * @param id The id of an image set.
 * **/
Table.prototype.__updateImageSetMetaInformation = function (resultImageSet, id) {
    var $body = $('body');
    var refImg = $body.find('tr[id="imageRow_' + id + '"] td[role="referenceImage"]');
    var diffImg = $body.find('tr[id="imageRow_' + id + '"] td[role="diffImage"]');
    var imageSuffix = '?timestamp=' + new Date().getTime();

    // Set new images
    diffImg.find('a[role="imageLink"]').attr('href', this.__sanitizeImagePaths(resultImageSet.diffImage.path) + imageSuffix);
    diffImg.find('img[role="image"]').attr('src', this.__sanitizeImagePaths(resultImageSet.diffImage.path) + imageSuffix);
    refImg.find('a[role="imageLink"]').attr('href', this.__sanitizeImagePaths(resultImageSet.referenceImage.path) + imageSuffix);
    refImg.find('img[role="image"]').attr('src', this.__sanitizeImagePaths(resultImageSet.referenceImage.path.replace) + imageSuffix);

    // Display images and hide the no image existing text
    refImg.find('a[role="imageLink"]').removeClass('hidden');
    diffImg.find('a[role="imageLink"]').removeClass('hidden');
    refImg.find('.noImageAvailableText').addClass('hidden');
    diffImg.find('.noImageAvailableText').addClass('hidden');

    // Set meta information
    var refDesc = $body.find('tr[id="descriptionRow_' + id + '"] td[role="referenceDescription"]');
    var diffDesc = $body.find('tr[id="descriptionRow_' + id + '"] td[role="diffDescription"]');

    refDesc.find('*[role="imageName"]').text(resultImageSet.referenceImage.name);
    diffDesc.find('*[role="imageName"]').text(resultImageSet.diffImage.name);
    refDesc.find('*[role="height"]').text(resultImageSet.referenceImage.height);
    diffDesc.find('*[role="height"]').text(resultImageSet.referenceImage.height);
    refDesc.find('*[role="width"]').text(resultImageSet.referenceImage.width);
    diffDesc.find('*[role="width"]').text(resultImageSet.referenceImage.width);
    diffDesc.find('*[role="error"]').text(resultImageSet.error);
    diffDesc.find('*[role="percPixelDifference"]').text(resultImageSet.difference);
    diffDesc.find('*[role="distanceDifference"]').text(resultImageSet.distance);
};

/**
 * Creates an ajax loading icon element.
 *
 * @return {string} A loading icon div element.
 * **/
Table.prototype.__createAjaxLoadingIcon = function () {
    return '<div class="sk-circle ajaxLoadingIconAdditionalStyles" role ="ajaxLoadingIcon">'
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
 * @param imageSetId The id of the image set which is displayed in the row.
 * **/
Table.prototype.__enableLoaderForRow = function (imageSetId) {
    this.__getLoader(imageSetId).show();
};

/**
 * Disabled the ajax loading icon for the row.
 *
 * @param imageSetId The id of the image set which is displayed in the row.
 * **/
Table.prototype.__disableLoaderForRow = function (imageSetId) {
    this.__getLoader(imageSetId).hide();
};

/**
 * Returns the loader element for a row/image set.
 *
 * @param imageSetId The id of the image set which is displayed in the row.
 * @return ToDo
 * */
Table.prototype.__getLoader = function (imageSetId) {
    var $imageSet = this.$container.find('#imageSet_' + imageSetId);

    return $imageSet.find('.loader');
};

/**
 * Fixes the file path for images by removing the public part and fixing the slashes.
 *
 * @param {string} imagePath The file path to the image.
 * @return {string} The fixed file path.
 * **/
Table.prototype.__sanitizeImagePaths = function (imagePath) {
    return imagePath.replace('public', '.').replace(/\\/g, '/');
};

/**
 * Enables or disables all 'Modify Ignore Region' buttons in the list.
 *
 * @param {bool} enable True if the buttons should be enabled, else false.
 * **/
Table.prototype.__toggleIgnoreRegionDisableState = function (enable) {
    var $ignoreAreaButtons = $('button[data-action="addIgnoreRegions"]');

    if(enable) {
        $ignoreAreaButtons.each(function () {
            var $this = $(this);
            $(this).removeClass('disabledButton');
            $(this).removeAttr('disabled');
        });
    } else if (!enable) {
        $ignoreAreaButtons.each(function () {
            var $this = $(this);
            $(this).addClass('disabledButton');
            $(this).attr('disabled', 'disabled');
        });
    }
};