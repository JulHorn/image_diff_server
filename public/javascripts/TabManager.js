/**
 * Offers for a small pseudo tab implementation based on https://www.w3schools.com/howto/howto_js_tabs.asp.
 *
 * @param {Connector} connector The object to send requests to the server.
 * @param {Function} callback Called when the UI needs an update.
 * **/
var TabManager = function (connector, callback) {
    this.callback = callback;
    this.connector = connector;
    this.$container = $('#content');
    this.bindEvents();
};

/* ----- Methods ----- */

/**
 * Binds the eventhandler to the ui elements.
 * **/
TabManager.prototype.bindEvents = function () {
    var that = this;

    // Display data-sets for chosen option
    this.$container.on('click', 'button[data-action=changeTableContentMode]', function () {
        var $this = $(this);
        // Get display data
        var showFailed = $this.data('failed');
        var showPassed = $this.data('passed');

        // Set proper active state for tab button
        $('.tabButton').each(function () {
           $(this).removeClass('active');
        });

        $this.addClass('active');

        // Draw the fancy table
        that.$table.draw(that.data, {showFailed: showFailed, showPassed: showPassed});
    });
};

/**
 * Draws the header information.
 *
 * @param {Object} data Contains all information about the run job.
 * **/
TabManager.prototype.draw = function (data) {
    var content = '<div class="tab">';
    content += '<button class="tabButton active" data-passed=false data-failed=true data-action="changeTableContentMode">Failed</button>'
    content += '<button class="tabButton" data-passed=true data-failed=false data-action="changeTableContentMode">Passed</button>';
    content += '<button class="tabButton" data-passed=true data-failed=true data-action="changeTableContentMode">All</button>';
    content += '<div id="tabContent" class="tabcontent"/>';

    this.$container.html($(content));

    // Set data and draw initial table
    this.data = data;
    this.$tabContent = $('#tabContent');
    this.$table = new Table(this.connector, this.$tabContent, this.callback);

    this.$table.draw(data, {showFailed: true, showPassed: false});
};
