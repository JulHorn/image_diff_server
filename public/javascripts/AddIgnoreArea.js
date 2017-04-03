var AddIgnoreArea = function ($targetDiv, connector) {
    this.$container = $targetDiv;
    this.connector = connector;
    this.__init();
    this.bindEvents();
};

AddIgnoreArea.prototype.show = function (imagePath, imageSet) {
    var content = '';

    content += '<div class="ignoreRegion">';
    content += '<img id="addIgnoreImage" src="' + imagePath + '"/>';
    content += '<div>';
    content += '<button data-action="addIgnoreCancel">Cancel</button>';
    content += '<button data-action="addIgnoreOk" data-id="' + imageSet.id + '">Ok</button>';
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
        overlayOpacity: 0.5,
        areas: imageSet.ignoreAreas
    });
};

AddIgnoreArea.prototype.__init = function () {
    this.$container.hide();
};

AddIgnoreArea.prototype.bindEvents = function () {
    var that = this;

    this.$container.on('click', 'button[data-action=addIgnoreCancel]', function () {
        $('#addIgnoreImage').selectAreas('destroy');
        that.$container.hide();
        that.$container.html('');
    });

    this.$container.on('click', 'button[data-action=addIgnoreOk]', function () {
        var id = $(this).data('id');

        that.connector.modifyIgnoreAreas(id, $('#addIgnoreImage').selectAreas('relativeAreas'), function () {
            // returns an array of areas, with their size and coordinates on the original image
            $('#addIgnoreImage').selectAreas('destroy');
            that.$container.hide();
            that.$container.html('');
        });
    });
};