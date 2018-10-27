// ToDo Add all switch for projects, save last selected project in local storage

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
        that.$table.draw(that.project.imageSets, {showFailed: showFailed, showPassed: showPassed});
    });

    // ToDo
    this.$container.on('click', 'button[data-action=addProject]', function () {
        var $this = $(this);
        var newProjectName = prompt('Please enter the project name.','');

        if (newProjectName) {
            that.connector.addProject(newProjectName, function (job) {
                console.log(job, 'job');
            });
        } else {
            alert('Project name must not be empty.');
        }
    });

    // ToDo
    this.$container.on('click', 'button[data-action=editProject]', function () {
        var $this = $(this);
    });

    // ToDo
    this.$container.on('click', 'button[data-action=removeProject]', function () {
        var $this = $(this);
    });

    // Changes the active project
    this.$container.on('change', 'select[data-action=changeProject]', function () {
        var $this = $(this);

        $this.data('id');
        console.log($this);
    });
};

/**
 * Draws the header information.
 *
 * @param {Object} data Contains all information about the run job.
 * **/
TabManager.prototype.draw = function (data) {
    var imageModel = data.imageMetaInformationModel;
    var content = '<div class="tab">';
    content += '<button class="tabButton active" data-passed=false data-failed=true data-action="changeTableContentMode">Failed</button>';
    content += '<button class="tabButton" data-passed=true data-failed=false data-action="changeTableContentMode">Passed</button>';
    content += '<button class="tabButton" data-passed=true data-failed=true data-action="changeTableContentMode">All</button>';

    // ToDo Wrap in div
    content += '<button class="tabButton" data-action="addProject">Add</button>';
    content += '<button class="tabButton" data-action="editProject">Edit</button>';
    content += '<button class="tabButton" data-action="removeProject">Rem</button>';
    // ToDo: Add class
    content += '<select id="projectSelect" class="projectSelect" data-action="changeProject">';

    imageModel.projects.forEach(function (project) {
        content += '<option data-id="' + project.id + '">' + project.name + '</option>';
    });

    content += '</select>';

    content += '<div id="tabContent" class="tabcontent"/>';

    // var projectSelectContent = '<option id="">All</option>';

    // var selectedProjectId = this.$projectSelector.find(':selected').attr('id');
    // this.$numberOfSetsField.text(this.__getProject(selectedProjectId, imageModel.projects).imageSets.length);





    this.$container.html($(content));

    // Set data and draw initial table
    this.project = this.__getProject(imageModel.projects);
    this.$tabContent = $('#tabContent');

    this.$table = new Table(this.connector, this.$tabContent, this.project.id, this.callback);

    this.$table.draw(this.project.imageSets, {showFailed: true, showPassed: false});
};

/**
 * ToDo: Comments, foreach to each?
 * @param projects
 * @private
 */
TabManager.prototype.__getProject = function(projects) {
    var projectId = $('#projectSelect :selected').attr('data-id');

    return projects.find(function (project) {
        return projectId === project.id;
    });
};