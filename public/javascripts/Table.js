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
        that.connector.delete($(this).data('id'), function (data) {
            that.callback(data);
        });
        //$(this).parents('tr').remove();
    });

    // Bind add new image to reference imageaction to add button
    this.$container.on('click', 'button[data-action=add]', function () {
        var informationLabel = $(this).next('label');
        var button = $(this);
        var id = $(this).data('id');
        that.connector.makteToNewReferenceImage(id, function (data) {
            //var resultImageSet = that.__getImageSetById(id, data.imageMetaInformationModel);
            informationLabel.text('New reference image');

            that.callback(data);
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
        rowContent += '<label>Percentual difference:</label>';
        rowContent += '<label role="percPixelDifference">' + imageSet.difference + '</label><br>';
        rowContent += '<label>Distance:</label>';
        rowContent += '<label role="distanceDifference">' + imageSet.distance + '</label><br>';
        rowContent += '<label>Error:</label>';
        rowContent += '<label role="error">' + imageSet.error + '</label><br>';
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

    cellContent += '<a href="' + image.path.replace('public', '.') + '" role="imageLink">';
    cellContent += '<img src="' + image.path.replace('public', '.') + '" role="image"/>';
    cellContent += '</a>';

    cellContent += '<div>';
    cellContent += '<label>Name:</label>';
    cellContent += '<label role="imageName">' + image.name + '</label><br>';
    cellContent += '<label>Height:</label>';
    cellContent += '<label role="height">' + image.height + 'px</label><br>';
    cellContent += '<label>Width:</label>';
    cellContent += '<label role="width">' + image.width + 'px</label><br>';
    cellContent += '</div>';

    return cellContent;
};