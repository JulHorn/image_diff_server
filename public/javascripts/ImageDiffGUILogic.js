var ImageDiffGUILogic = function () {
    this.bindEvents();
    this.connector = new Connector();
};

ImageDiffGUILogic.prototype.bindEvents = function () {
    var that = this;

    $('table').on('click', 'button[data-action=delete]', function () {
        that.connector.delete($(this).data('id'), function (data) {
            that.__refreshMetaInformation(data);
        });
        $(this).parents('tr').remove();
    });

    $('table').on('click', 'button[data-action=add]', function () {
        var informationLabel = $(this).next('label');
        var button = $(this);
        var id = $(this).data('id');
        that.connector.makteToNewReferenceImage(id, function (data) {
            var resultImageSet = that.__getImageSetById(id, data);
            informationLabel.text('New reference image');
            that.__refreshMetaInformation(data);
            button.parents('tr').find('#referenceImage').attr('src', resultImageSet.referenceImage.path.replace('public', '.') + '?timestamp=' + new Date().getTime());
            button.parents('tr').find('#diffImage').attr('src', resultImageSet.diffImage.path.replace('public', '.') + '?timestamp=' + new Date().getTime());
        });
    });

    $('body').on('click', 'button[data-action=refreshAll]', function () {
        that.connector.refreshAll(function () {
            $('#refreshAllText').text('Started to recalculate all image differences. This might take a while.');
        });
    });
};

ImageDiffGUILogic.prototype.__getImageSetById = function (id, imageMetaModel) {
    return imageMetaModel.imageSets.filter(function (imageSet) {
       return imageSet.id === id;
    })[0];
};

ImageDiffGUILogic.prototype.__refreshMetaInformation = function (data) {
    console.log('meta', data);
    console.log(typeof data);
    $('#timeStamp').text(data.timeStamp);
    $('#numberOfSets').text(data.imageSets.length);
    $('#maxPixelPercentage').text(data.biggestPercentualPixelDifference);
    $('#maxDistance').text(data.biggestDistanceDifference);
};
