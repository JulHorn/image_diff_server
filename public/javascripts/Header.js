/**
 * Offers logic to handle the header.
 *
 * @param {Connector} connector The object to send requests to the server.
 * @param {Function} callback Called when the UI needs an update.
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
        });
        // Get current job to update values
        that.connector.getActiveJob(function (data) {
            that.callback(data);
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
 * @param {Object} data Contains all information about the run job.
 * **/
Header.prototype.draw = function (data) {
    console.log(data, 'data');
    var imageModel = data.imageMetaInformationModel;
    imageModel.timeStamp ? this.$timeStampField.text(imageModel.timeStamp) : this.$timeStampField.text('Job is currently running');

    this.$maxPixelPercentageField.text(imageModel.biggestPercentualPixelDifference + '% of allowed ' + data.imageMetaInformationModel.percentualPixelDifferenceThreshold + '%');
    this.$maxDistanceField.text(imageModel.biggestDistanceDifference + ' of allowed ' + data.imageMetaInformationModel.distanceDifferenceThreshold);
    this.$progressIndicator.attr('max',data.imagesToBeProcessedCount);
    this.$progressIndicator.val(data.processedImageCount);
    this.$currentJobField.text(data.jobName);

    // ToDo: Move this to TabManager
    this.$numberOfSetsField.text(imageModel.projects[0].imageSets.length);
};

/**
 * Assigns web elements to prototype variables.
 * **/
Header.prototype.__initElements = function () {
    this.$timeStampField = this.$container.find('#timeStamp');
    this.$numberOfSetsField = this.$container.find('#numberOfSets');
    this.$maxPixelPercentageField = this.$container.find('#maxPixelPercentage');
    this.$maxDistanceField = this.$container.find('#maxDistance');
    this.$progressIndicator = this.$container.find('#progressIndicator');
    this.$currentJobField = this.$container.find('#currentJob');
};