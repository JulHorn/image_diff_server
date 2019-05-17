/**
 * Offers logic to handle the table.
 *
 * @param {Connector} connector The object to send requests to the server
 * @param container The container (e.g. a div) in which the table will be drawn in
 * @param {Function} callback Called when the UI needs an update.
 * **/
var Table = function (connector, container, callback) {
    this.callback = callback;
    this.connector = connector;
    this.$container = container;

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
        var $this = $(this);
        var id = $this.data('id');

        // Disables the edited row and displays a loading icon
        that.__enableLoaderForRow(id);

        that.connector.delete($(this).data('id'), function (data) {
            that.callback(data, that, 'redrawNone');

            // Remove the row manually for a better user experience
            that.$container.find('#imageSet_' + id).remove();
        });
    });

    // Open ignore region pane
    this.$container.on('click', 'button[data-action=addIgnoreRegions]', function () {
        var $this = $(this);
        var $ignoreRegion = $('#markedAreasRegion');
        var id = $this.data('id');
        var imgPath = that.__sanitizeImagePaths($this.data('image'));

        that.connector.getImageSet(id, function (data) {
            new ModifyMarkedAreas($ignoreRegion).show(imgPath, data.resultImageSet, data.resultImageSet.ignoreAreas, function (markedAreas) {
				that.connector.modifyIgnoreAreas(id, markedAreas, function (data) {
					$this.siblings('#ignoreAreaField').text(data.resultImageSet.ignoreAreas.length);
				});
            });
        });
    });

	this.$container.on('click', 'button[data-action=addCheckRegions]', function () {
		var $this = $(this);
		var $checkRegion = $('#markedAreasRegion');
		var id = $this.data('id');
		var imgPath = that.__sanitizeImagePaths($this.data('image'));

		that.connector.getImageSet(id, function (data) {
			new ModifyMarkedAreas($checkRegion).show(imgPath, data.resultImageSet, data.resultImageSet.checkAreas, function (markedAreas) {
			    that.connector.modifyCheckAreas(id, markedAreas, function (data) {
					$this.siblings('#checkAreaField').text(data.resultImageSet.checkAreas.length);
				});
			});
		});
	});

    // Bind add new image to reference image action to add button
    this.$container.on('click', 'button[data-action=add]', function () {
        var $this = $(this);
        var informationLabel = $this.next('label');
        var id = $this.data('id');

        // Disables the edited row and displayes a loading icon
        that.__enableLoaderForRow(id);

        that.connector.makeToNewReferenceImage(id, function (data) {
            informationLabel.text('New reference image');

            // Draw all other components but the table because there could be some bad performance with a lot of images
            that.callback(data, that);
            // Give data back to have the correct data for the table stored
            that.callback(data, null, 'redrawNone');

            // Update the row manually for a better performance
            that.__updateImageSetMetaInformation(data.updatedImageSet, id);

            that.__disableLoaderForRow(id);
        });
    });

    // Register event to enable the change of the imageSet project
    this.$container.on('change', 'select[data-action=changeProject]', function () {
        var $this = $(this);
        var imageSetId = $this.data('imagesetid');
        var oldProjectId = $this.data('oldprojectid');
        var newProjectId = $this.find(':selected').data('id');

        // Disables the edited row and displayes a loading icon
        that.__enableLoaderForRow(imageSetId);

        that.connector.assignImageSetToProject(imageSetId, oldProjectId, newProjectId, function (data) {
            // Draw all other components but the table because there could be some bad performance with a lot of images
            that.callback(data, that, 'redrawTable');
            that.__disableLoaderForRow(imageSetId);
        });
    });
};

/**
 * Draws the table and its content.
 *
 * @param {Array} projects All existing projects.
 * @param {Object} displayOptions It is possible to set the properties showFailed/showPassed with boolean values to determine
 *  what should be displayed in the table. If no object was given, only the failure image sets will be displayed.
* **/
Table.prototype.draw = function (projects, displayOptions) {
    var that = this;
    var rowColor = 'dark';
    var tableHasContent = false;
    // Create table header
    var content = '<table class="tableImageSets"><thead><th class="tableimageSetsHeadlineCell">Reference</th><th>New</th><th>Diff</th></thead></table>';

    projects.forEach(function (project) {
        if (displayOptions.projects.includes(project.id)) {
            // Create one image and one description corresponding row for every image set
            project.imageSets.forEach(function (imageSet) {
                var display = that.__shouldImageSetBeDisplayed(displayOptions, imageSet.isThresholdBreached);

                // Only display sets with a breached threshold
                // E.g. images with no breached threshold and ignore zones will be correctly displayed or not
                if(display) {
                    // Get content for the image and description rows
                    var imageRowContent = that.__createImageRow(imageSet);
                    var descriptionRowContent = that.__createDescriptionRow(imageSet);
                    var headerRowContent = that.__createHeaderRow(imageSet, project.id, projects);

                    // Add the content as new rows to the table
                    content += '<div class="imageSet" id="imageSet_' + imageSet.id + '" projectId="' + project.id + '">';
                    content += '<table class="tableImageSets">';
                    content += '<tr id="headerRow_' + imageSet.id + '" class="headerRow ' + rowColor + '">' + headerRowContent + '</tr>';
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
                    // Used to determine whether a placeholder should be dispayed
                    tableHasContent = true;
                }

            });
        }
    });

    // Display info text if table has no data to prevent a faulty looking table
    if (tableHasContent) {
        this.$container.html($(content));
    } else {
        content = '<div class="noDataAvailable"><span>No data available</span></div>';
        this.$container.html($(content));
    }

};

/**
 * Determines whether an image set should be displayed in the table.
 *
 * @param displayOptions It is possible to set the properties showFailed/showPassed with boolean values to determine
 *  what should be displayed in the table. If no object was given, only the failure image sets will be displayed.
 * @param isThresholdBreached True or false. Was the image set threshold breached?
 * @return {boolean}
 * @private
 */
Table.prototype.__shouldImageSetBeDisplayed = function(displayOptions, isThresholdBreached) {
    var display = false;

    // Discern if image set should be displayed
    if (displayOptions) {
        display = displayOptions.showFailed && isThresholdBreached;
        display = display || displayOptions.showPassed && !isThresholdBreached;
    } else {
        // If no parameter were given, display failures as default value
        display = isThresholdBreached;
    }

    return display;
};

/**
* Creates the content for the image row.
*
* @param {Object} imageSet The imageSet object which contains the information about the images.
* @return {String} The image content for a table row.
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
 * Returns the content of for the header row.
 *
 * @param {Object} imageSet The imageSet object which contains the information about the images.
 * @param {String} projectId The project id of the image set the header id should be created for.
 * @param {Array} projects All existing projects.
 * @return {String} The header content for a table row.
 * */
Table.prototype.__createHeaderRow = function (imageSet, projectId, projects) {
    var that = this;
    var rowContent = '';
    var name = '';

    if(imageSet.referenceImage.name) { name = imageSet.referenceImage.name; }
    else if(imageSet.newImage.name) { name = imageSet.newImage.name; }
    else if(imageSet.diff.name) { name = imageSet.diff.name; }
    else { name = 'No name found.'; }

    rowContent += '<td colspan="3">';
    rowContent += '<div>';
    rowContent += '<h2>' + name + '</h2>';
    rowContent += '<select class="projectSelectProject" data-oldProjectId="' + projectId + '" data-imageSetId="' + imageSet.id + '" data-action="changeProject">';
    projects.forEach(function (project) {
        var isActiveProject = projectId === project.id;

        rowContent += that.__createProjectOption(project.id, project.name, isActiveProject);
    });

    rowContent += '</select>';
    rowContent += '</div>';
    rowContent += '</td>';


    return rowContent;
};

/**
* Creates the content for the description row.
*
* @param {Object} imageSet The imageSet object which contains the information about the images.
* @return {String} The description content for a table row.
* */
Table.prototype.__createDescriptionRow = function (imageSet) {
    var desRowContent = '';

    desRowContent += '<td role="referenceDescription" id="' + imageSet.id + '">';
    desRowContent += this.__createDefaultDescriptionCellContent(imageSet.referenceImage);
    desRowContent += '<span>Ignored Areas:</span>';
    desRowContent += '<span id="ignoreAreaField">' + imageSet.ignoreAreas.length + '</span><br>';
	desRowContent += '<span>Check Areas:</span>';
	desRowContent += '<span id="checkAreaField">' + imageSet.checkAreas.length + '</span><br>';
	desRowContent += '<button data-id="' + imageSet.id + '" data-action="delete">Delete</button>';

    // Disable button if no image exists
    if(imageSet.referenceImage.path) {
        desRowContent += '<button data-id="' + imageSet.id + '" data-image="' + imageSet.referenceImage.path +  '" data-action="addIgnoreRegions">Modify Ignore Regions</button>';
		desRowContent += '<button data-id="' + imageSet.id + '" data-image="' + imageSet.referenceImage.path +  '" data-action="addCheckRegions">Modify Check Regions</button>';
    } else {
        desRowContent += '<button class="disabledButton" disabled data-id="' + imageSet.id + '" data-image="' + imageSet.referenceImage.path +  '" data-action="addIgnoreRegions">Modify Ignore Regions</button>';
		desRowContent += '<button class="disabledButton" disabled data-id="' + imageSet.id + '" data-image="' + imageSet.referenceImage.path +  '" data-action="addCheckRegions">Modify Check Regions</button>';
    }
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
    desRowContent += '<span>Pixel difference:</span>';
    desRowContent += '<span role="percPixelDifference">' + imageSet.difference + '%</span><br>';
    desRowContent += '<span>Hamming distance:</span>';
    desRowContent += '<span role="distanceDifference">' + imageSet.distance + '</span><br>';

    // Display error only if there is really one
    if (imageSet.error) {
        desRowContent += '<span>Error:</span>';
        desRowContent += '<span role="error">' + imageSet.error + '</span><br>';
    }

    desRowContent += '</div>';
    desRowContent += '</td>';

    return desRowContent;
};

/**
 * Creates the default description cell content.
 *
 * @param {Object} image The image object containing information about an image.
 * @return {String} A div which contains information about the height, width and name of an image.
 * **/
Table.prototype.__createDefaultDescriptionCellContent = function (image) {
    var cellContent = '';

    cellContent += '<div>';
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
 * @param {String} id The id of the image set which should be retrieved.
 * @param {Object} imageMetaModel The image information imageMetaInformationModel in which the sets are located.
 * @return {Object} The found image set.
 * **/
Table.prototype.__getImageSetById = function (id, imageMetaModel) {
    return imageMetaModel.imageSets.filter(function (imageSet) {
        return imageSet.id === id;
    })[0];
};

/**
 * Creates the default content of a cell (image with link, basic information).
 *
 * @return {String} The created cell content.
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
 * @param {Object} resultImageSet The image set with the new information.
 * @param {String} id The id of an image set.
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
    refImg.find('img[role="image"]').attr('src', this.__sanitizeImagePaths(resultImageSet.referenceImage.path) + imageSuffix);

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
 * @return {String} A loading icon div element.
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
 * @param {String} imageSetId The id of the image set which is displayed in the row.
 * **/
Table.prototype.__enableLoaderForRow = function (imageSetId) {
    this.__getLoader(imageSetId).show();
};

/**
 * Disabled the ajax loading icon for the row.
 *
 * @param {String} imageSetId The id of the image set which is displayed in the row.
 * **/
Table.prototype.__disableLoaderForRow = function (imageSetId) {
    this.__getLoader(imageSetId).hide();
};

/**
 * Returns the loader element for a row/image set.
 *
 * @param {String} imageSetId The id of the image set which is displayed in the row.
 * @return {Object} The loader element for that row.
 * */
Table.prototype.__getLoader = function (imageSetId) {
    var $imageSet = this.$container.find('#imageSet_' + imageSetId);

    return $imageSet.find('.loader');
};

/**
 * Fixes the file path for images by removing the public part and fixing the slashes.
 *
 * @param {String} imagePath The file path to the image.
 * @return {String} The fixed file path.
 * **/
Table.prototype.__sanitizeImagePaths = function (imagePath) {
    return imagePath.replace('public', '.').replace(/\\/g, '/');
};

/**
* Creates a an option element for a select with project information.
 *
* @param {String} projectId The id of the project which will be added as data-id.
* @param {String} projectName The name that should be displayed.
* @param {Boolean} isActiveProject Determines wheter the option should be active initially.
* @private
*/
Table.prototype.__createProjectOption = function (projectId, projectName, isActiveProject) {
    var activeOption = '';

    if (isActiveProject) {
        activeOption = 'selected';
    }

    return '<option data-id="' + projectId + '" ' + activeOption + '>' + projectName + '</option>';
};