/**
 * @param callback Called when the UI needs an update.
 * **/
var Header = function (connector, callback) {
    this.callback = callback;
    this.connector = connector;
    this.$container = $('body');

    this.bindEvents();

    // Get the server endpoint to which the requests will be send and display it in the textfield
    $('#serverAddress').val(this.connector.getServerEndpoint());
};

/* ----- Methods ----- */

/**
 * Binds the eventhandler to the ui elements.
 * **/
Header.prototype.bindEvents = function () {
    var that = this;

    // Bind save server endpoint to save button
    this.$container.on('click', 'button[data-action=saveServerAddress]', function () {
        localStorage.imageDiffServerEndpoint = $('#serverAddress').val();
    });

    // Bind calculate all diff images to the corresponding button
    this.$container.on('click', 'button[data-action=refreshAll]', function () {
        that.connector.refreshAll(function (data) {
            that.callback(data);
        });
        $('#refreshAllText').text('Started to recalculate all image differences. This might take a while.');
    });
};

/**
 * @param data Contains all information about the run job.
 * **/
Header.prototype.draw = function (data) {
    this.$container.find('#timeStamp').text(data.timeStamp);
    this.$container.find('#numberOfSets').text(data.imageSets.length);
    this.$container.find('#maxPixelPercentage').text(data.biggestPercentualPixelDifference);
    this.$container.find('#maxDistance').text(data.biggestDistanceDifference);
};