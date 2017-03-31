var AddIgnoreArea = function ($targetDiv) {
    this.$container = $targetDiv;
    this.__init();
    this.bindEvents();
};

AddIgnoreArea.prototype.show = function (imagePath, id) {
    var content = '';

    content += '<div class="ignoreRegion">';
    content += '<img id="addIgnoreImage" src="' + imagePath + '"/>';
    content += '<div>';
    content += '<button data-action="addIgnoreCancel">Cancel</button>';
    content += '<button data-action="addIgnoreOk">Ok</button>';
    content += '</div>';
    content += '</div>';

    this.$container.html($(content));
    this.$container.show();

    $('#addIgnoreImage').selectAreas({
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
        overlayOpacity: 0.5
    });
};

AddIgnoreArea.prototype.__init = function () {
    this.$container.hide();
};

AddIgnoreArea.prototype.bindEvents = function () {
    var that = this;

    this.$container.on('click', 'button[data-action=addIgnoreCancel]', function () {
        that.$container.hide();
        that.$container.html('');
    });

    this.$container.on('click', 'button[data-action=addIgnoreOk]', function () {
        // returns an array of areas, with their size and coordinates on the original image
        console.log($('#addIgnoreImage').selectAreas('relativeAreas'));

        that.$container.hide();
        that.$container.html('');
    });
};