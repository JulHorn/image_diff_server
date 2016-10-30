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
            that.__updateImageSetMetaInformation(resultImageSet, button.parents('tr'));
        });
    });

    $('body').on('click', 'button[data-action=refreshAll]', function () {
        that.connector.refreshAll(function () {
            $('#refreshAllText').text('Started to recalculate all image differences. This might take a while.');
        });
    });
};

ImageDiffGUILogic.prototype.__updateImageSetMetaInformation = function (resultImageSet, parentElement) {
    var refImg = parentElement.find('td[role="referenceImage"]');
    var newImg = parentElement.find('td[role="newImage"]');
    var diffImg = parentElement.find('td[role="diffImage"]');
    var imageSuffix = '?timestamp=' + new Date().getTime();

    // Set new images after a short delay because the new image might not be written yet otherwise
    window.setTimeout(function () {
        diffImg.find('a[role="imageLink"]').attr('href', resultImageSet.diffImage.path.replace('public', '.') + imageSuffix);
        diffImg.find('img[role="image"]').attr('src', resultImageSet.diffImage.path.replace('public', '.') + imageSuffix);
        refImg.find('a[role="imageLink"]').attr('href', resultImageSet.referenceImage.path.replace('public', '.') + imageSuffix);
        refImg.find('img[role="image"]').attr('src', resultImageSet.referenceImage.path.replace('public', '.') + imageSuffix);
    }, 100);

    // Set meta information
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
