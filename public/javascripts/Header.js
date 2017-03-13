/**
 * Offers logic to handle the header.
 *
 * @param connector The object to send requests to the server.
 * @param callback Called when the UI needs an update.
 * **/
var Header = function (connector, callback) {
    this.callback = callback;
    this.connector = connector;
    this.$container = $('#header');

    this.__initElements();
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
        // Trigger the compare all images job
        that.connector.refreshAll(function (data) {
            that.callback(data);
            that.$refreshAllTextField.text('Done!');
        });
        // Get current job to update values
        that.connector.getActiveJob(function (data) {
            that.callback(data);
            that.$refreshAllTextField.text('Started to recalculate all image differences. This might take a while.');
        });
    });

    // Refresh data from server
    this.$container.on('click', 'button[data-action=refresh]', function () {
        that.connector.getActiveJob(function (data) {
            that.callback(data);
        });
    });
};

/**
 * Draws the header information.
 *
 * @param data Contains all information about the run job.
 * **/
Header.prototype.draw = function (data) {
    data.imageMetaInformationModel.timeStamp ? this.$timeStampField.text(data.imageMetaInformationModel.timeStamp) : this.$timeStampField.text('Job is currently running');

    this.$numberOfSetsField.text(data.imageMetaInformationModel.imageSets.length);
    this.$maxPixelPercentageField.text(data.imageMetaInformationModel.biggestPercentualPixelDifference);
    this.$maxDistanceField.text(data.imageMetaInformationModel.biggestDistanceDifference);
    this.$progressIndicatorField.text(data.processedImageCount + '/' + data.imagesToBeProcessedCount);
    this.$currentJobField.text(data.jobName);
};

Header.prototype.__initElements = function () {
    this.$timeStampField = this.$container.find('#timeStamp');
    this.$numberOfSetsField = this.$container.find('#numberOfSets');
    this.$maxPixelPercentageField = this.$container.find('#maxPixelPercentage');
    this.$maxDistanceField = this.$container.find('#maxDistance');
    this.$progressIndicatorField = this.$container.find('#progressIndicator');
    this.$currentJobField = this.$container.find('#currentJob');
    this.$refreshAllTextField = $('#refreshAllText');
};