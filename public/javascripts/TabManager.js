// ToDo Add all switch for projects, save last selected project in local storage, disable remove/edit button when initially project is "All" or default

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
    this.tableDrawOptions = {showFailed: true, showPassed: false, projects: []};

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
        var showPassed = $this.data('passed');
        var showFailed = $this.data('failed');

        // Set proper active state for tab button
        $('.tabButton').each(function () {
           $(this).removeClass('active');
        });

        $this.addClass('active');
        that.tableDrawOptions = {showFailed: showFailed, showPassed: showPassed};

        // Draw the fancy table
        that.__drawTable();
    });

    // Adds another project and updates the select
    this.$container.on('click', 'button[data-action=addProject]', function () {
        var newProjectName = prompt('Please enter the project name.','');

        if (newProjectName) {
            that.connector.addProject(newProjectName, function (newProject) {
                var newOption = that.__createProjectOption(newProject.id, newProject.name);

                that.$container.find('#projectSelect').append(newOption);
            });
        }
    });

    // Renames a project
    this.$container.on('click', 'button[data-action=editProject]', function () {
        var newProjectName = prompt('Please enter the project name.','');

        if (newProjectName) {
            var projectSelectOption = that.$container.find('#projectSelect :selected');
            var projectToBeRenamedId = projectSelectOption.attr('data-id');

            that.connector.editProject(newProjectName, projectToBeRenamedId, function (wasSuccessfull) {
                projectSelectOption.text(newProjectName);
            });
        }
    });

    // Removes a project
    this.$container.on('click', 'button[data-action=removeProject]', function () {
        var projectSelectOption = that.$container.find('#projectSelect :selected');
        var projectToBeDeletedId = projectSelectOption.attr('data-id');

        if (confirm("Dou you really want to delete the project? All items of that project will be deleted too.")) {
            that.connector.removeProject(projectToBeDeletedId, function (wasSuccessfull) {
                console.log(deletedProjectId, 'deletedProjectId');
                projectSelectOption.remove();
            });
        }
    });

    // Changes the active project
    this.$container.on('change', 'select[data-action=changeProject]', function () {
        var currentProjectId = String($('#projectSelect :selected').data('id'));
        var removeProjectButton = $('#removeProjectButton');
        var editProjectButton = $('#editProjectButton');

        //  Disables remove button for "All" and default project
        if (currentProjectId === '-1' || currentProjectId === '0') {
            removeProjectButton.attr('disabled', 'disabled');
        } else {
            removeProjectButton.removeAttr('disabled');
        }

        //  Disables edit button for "All"
        if (currentProjectId === '-1') {
            editProjectButton.attr('disabled', 'disabled');
        } else {
            editProjectButton.removeAttr('disabled');
        }

        that.__drawTable();
    });
};

/**
 * Draws the header information.
 *
 * @param {Object} data Contains all information about the run job.
 * **/
TabManager.prototype.draw = function (data) {
    var that = this;
    var content = '<div class="tab">';
    this.imageModel = data.imageMetaInformationModel;

    content += '<div>';
    content += '<button id="showPassedButton" class="tabButton active" data-passed=false data-failed=true data-action="changeTableContentMode">Failed</button>';
    content += '<button id="showFailedButton" class="tabButton" data-passed=true data-failed=false data-action="changeTableContentMode">Passed</button>';
    content += '<button class="tabButton" data-passed=true data-failed=true data-action="changeTableContentMode">All</button>';
    content += '</div>';

    content += '<div>';
    content += '<button id="addProjectButton" class="tabButtonProject" data-action="addProject">Add</button>';
    content += '<button id="editProjectButton" class="tabButtonProject" data-action="editProject">Edit</button>';
    content += '<button id="removeProjectButton" class="tabButtonProject" data-action="removeProject">Rem</button>';

    // ToDo: Add class, use icons for button
    // ToDo Add prototype select property for easier access
    content += '<select id="projectSelect" class="tabSelectProject" data-action="changeProject">';
    content += '<option data-id="-1">All</option>';
    this.imageModel.projects.forEach(function (project) {
        content += that.__createProjectOption(project.id, project.name);
    });

    content += '</select>';
    content += '</div>';
    content += '<div id="tabContent" class="tabcontent"/>';

    this.$container.html($(content));


    // ToDo Declare prototype vars in constructor
    // Set data and draw initial table
    this.$tabContent = $('#tabContent');
    this.$table = new Table(this.connector, this.$tabContent, this.callback);
    this.__drawTable();
};

/**
 * Creates a an option element for a select with project information.
 *
 * @param {String} projectId The id of the project which will be added as data-id.
 * @param {String} projectName The name that should be displayed.
 * @private
 */
TabManager.prototype.__createProjectOption = function (projectId, projectName) {
    return '<option data-id="' + projectId + '">' + projectName + '</option>';
};

TabManager.prototype.__drawTable = function () {
    var projectId = String($('#projectSelect :selected').data('id'));
    var projectsToDraw = [];
    // Get all imageSets if "All" in project select was is selected
    if (projectId === '-1') {

        this.imageModel.projects.forEach(function (project) {
            projectsToDraw.push(project.id);
        });

    } else {
        var selectedProject = this.imageModel.projects.find(function (project) {
            return projectId === project.id;
        });

        projectsToDraw.push(selectedProject.id);
    }

    this.tableDrawOptions.projects = projectsToDraw;

    this.$table.draw(this.imageModel.projects, this.tableDrawOptions);
};