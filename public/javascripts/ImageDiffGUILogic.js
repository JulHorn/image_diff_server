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
};

ImageDiffGUILogic.prototype.__refreshMetaInformation = function (data) {
    $('#timeStamp').text(data.timeStamp);
    $('#numberOfSets').text(data.imageSets.length);
    $('#maxPixelPercentage').text(data.biggestPercentualPixelDifference);
    $('#maxDistance').text(data.biggestDistanceDifference);
};
