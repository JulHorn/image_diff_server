/**
 * Creates the select area for images prototype.
 * ToDo: Rename stuff
 * @param {Object} $targetDiv The jQuery object under which the ignore area select stuff will be added.
 * @constructor
 * **/
var AddIgnoreArea = function ($targetDiv) {
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
 * @param markedAreas ToDO
 * @param {Function} callback The callback function which will be called when the ignore area window was closed via OK button.
 * **/
AddIgnoreArea.prototype.show = function (imagePath, imageSet, markedAreas, callback) {
    this.callback = callback;
    this.__createMarkup(imagePath, imageSet);
    this.__configureSelectAreaPlugin(markedAreas);
};

/**
 * Binds the event handler to the ui elements.
 * **/
AddIgnoreArea.prototype.bindEvents = function () {
    var that = this;

    //  Cancel window
    this.$container.on('click', 'button[data-action=addIgnoreCancel]', function () {
        that.$container.hide();
        that.$container.html('');
    });

    // Submit data to server
    this.$container.on('click', 'button[data-action=addIgnoreOk]', function () {
        var id = $(this).data('id');
        console.log('$(\'#addIgnoreImage\')', $('#addIgnoreImage'));

		var selectedAreas = that.$container.find('#addIgnoreImage').selectAreas('relativeAreas');
		console.log('selectedAreas', selectedAreas);

		if (that.callback) {
			that.callback(selectedAreas);
		}

		that.$container.hide();
		// Off event handler to prevent
		that.$container.off('click', 'button[data-action=addIgnoreOk]');
		that.$container.html('');
    });
};

/**
 * Init stuff.
 * **/
AddIgnoreArea.prototype.__init = function () {
    this.$container.hide();
};

/**
 * Creates the markup for the modify ignore area window and displays it.
 *
 * @param {String} imagePath The image path to the image which should be displayed in the ignore image window.
 * @param {ImageSet} imageSet The image which contains the image information.
 * **/
AddIgnoreArea.prototype.__createMarkup = function (imagePath, imageSet) {
    var content =
        '<div class="ignoreRegion">'
        + '<div class="ignoreRegionImageArea">'
        + '<div class="ignoreRegionImageAreaInner" style="width: ' + imageSet.referenceImage.width + 'px">'
        + '<img id="addIgnoreImage" src="' + imagePath + '"/>'
        + '</div>'
        + '</div>'
        + '<div class="ignoreRegionButtonBar">'
        + '<button data-action="addIgnoreCancel">Cancel</button>'
        + '<button data-action="addIgnoreOk" data-id="' + imageSet.id + '">Ok</button>'
        + '</div>'
        + '</div>';

    this.$container.html($(content));
    this.$container.show();
};

/**
 * Configures the jQuery plugin for the select area stuff.
 *
 * @param markedAreas ToDo
 * **/
AddIgnoreArea.prototype.__configureSelectAreaPlugin = function (markedAreas) {
    this.$container.find('#addIgnoreImage').selectAreas({
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