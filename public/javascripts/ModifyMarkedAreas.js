/**
 * Creates the select area for images prototype.
 * @param {Object} $targetDiv The jQuery object under which the ignore area select stuff will be added.
 * @constructor
 * **/
var ModifyMarkedAreas = function ($targetDiv) {
    this.$container = $targetDiv;
    this.callback = null;
    this.__init();
    this.bindEvents();
};

/**
 * Displays the ignore area modification window.
 *
 * @param {String} imagePath The image path to the image which should be displayed in the ignore image window.
 * @param {ImageSet} imageSet The image which contains the image information.
 * @param {MarkedArea[]} markedAreas The marked areas which should be displayed in the pane.
 * @param {Function} callback The callback function which will be called when the ignore area window was closed via OK button.
 * **/
ModifyMarkedAreas.prototype.show = function (imagePath, imageSet, markedAreas, callback) {
    this.callback = callback;
    this.__createMarkup(imagePath, imageSet);
    this.__configureSelectAreaPlugin(markedAreas);
};

/**
 * Binds the event handler to the ui elements.
 * **/
ModifyMarkedAreas.prototype.bindEvents = function () {
    var that = this;

    //  Cancel window
    this.$container.on('click', 'button[data-action=modifyMarkedAreasRegionCancel]', function () {
        that.$container.hide();
		// Off event handler to prevent
		that.$container.off('click', 'button[data-action=modifyMarkedAreasRegionOk]');
        that.$container.html('');
    });

    // Submit data to server
    this.$container.on('click', 'button[data-action=modifyMarkedAreasRegionOk]', function () {
        var id = $(this).data('id');

		var selectedAreas = that.$container.find('#modifyMarkedAreasRegionImage').selectAreas('relativeAreas');

		if (that.callback) {
			that.callback(selectedAreas);
		}

		that.$container.hide();
		// Off event handler to prevent
		that.$container.off('click', 'button[data-action=modifyMarkedAreasRegionOk]');
		that.$container.html('');
    });
};

/**
 * Init stuff.
 * **/
ModifyMarkedAreas.prototype.__init = function () {
    this.$container.hide();
};

/**
 * Creates the markup for the modify ignore area window and displays it.
 *
 * @param {String} imagePath The image path to the image which should be displayed in the ignore image window.
 * @param {ImageSet} imageSet The image which contains the image information.
 * **/
ModifyMarkedAreas.prototype.__createMarkup = function (imagePath, imageSet) {
    var content =
        '<div class="modifyMarkedAreasRegion">'
        + '<div class="modifyMarkedAreasRegionImageArea">'
        + '<div class="modifyMarkedAreasRegionImageAreaInner" style="width: ' + imageSet.referenceImage.width + 'px">'
        + '<img id="modifyMarkedAreasRegionImage" src="' + imagePath + '"/>'
        + '</div>'
        + '</div>'
        + '<div class="modifyMarkedAreasRegionButtonBar">'
        + '<button data-action="modifyMarkedAreasRegionCancel">Cancel</button>'
        + '<button data-action="modifyMarkedAreasRegionOk" data-id="' + imageSet.id + '">Ok</button>'
        + '</div>'
        + '</div>';

    this.$container.html($(content));
    this.$container.show();
};

/**
 * Configures the jQuery plugin for the select area stuff.
 *
 * @param {MarkedArea[]} markedAreas The marked areas to be manipulated and displayed.
 * **/
ModifyMarkedAreas.prototype.__configureSelectAreaPlugin = function (markedAreas) {
    this.$container.find('#modifyMarkedAreasRegionImage').selectAreas({
        // editable
        allowEdit: true,
        // moveable
        allowMove: true,
        // resizable
        allowResize: false,
        // selectable
        allowSelect: true,
        // deletable
        allowDelete: true,
        // allows keyboard arrows for moving the selection
        allowNudge: true,
        // keeps a specified aspect ration
        aspectRatio: 0,
        // opacity of the moving dotted outline around a selection
        outlineOpacity: 0.5,
        // opacity of the overlay layer over the image
        overlayOpacity: 0.5,
        areas: markedAreas
    });
};