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
	this.$tabContent = {};
	this.$table = {};

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
            that.connector.addProject(newProjectName, function (data) {
                that.callback(data, null);
            });
        }
    });

    // Renames a project
    this.$container.on('click', 'button[data-action=editProject]', function () {
        var projectSelectOption = that.$container.find('#projectSelect :selected');
        var projectToBeRenamedId = projectSelectOption.attr('data-id');
        var currentProjectName = projectSelectOption.text();
        var newProjectName = prompt('Please enter the new project name for the project "' + currentProjectName + '" (ID:' + projectToBeRenamedId + ' )','');

        if (newProjectName) {
            that.connector.editProject(newProjectName, projectToBeRenamedId, function (data) {
                // projectSelectOption.text(newProjectName);
                that.callback(data, null);
            });
        }
    });

    // Removes a project
    this.$container.on('click', 'button[data-action=removeProject]', function () {
        var projectSelectOption = that.$container.find('#projectSelect :selected');
        var projectToBeDeletedId = projectSelectOption.attr('data-id');

        if (confirm("Dou you really want to delete the project? All items of that project will be deleted too.")) {
            that.connector.removeProject(projectToBeDeletedId, function (data) {
                console.log(projectToBeDeletedId, 'deletedProjectId');
                that.callback(data, null);
            });
        }
    });

    // Changes the active project
    this.$container.on('change', 'select[data-action=changeProject]', function () {
        that.__updateProjectButtonStates();
        that.__updateImageSetCount();
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
    content += '<button id="showPassedButton" class="tabButton active" data-passed=false data-failed=true data-action="changeTableContentMode">Failed <span id="failedCount">(0)</span></button>';
    content += '<button id="showFailedButton" class="tabButton" data-passed=true data-failed=false data-action="changeTableContentMode">Passed <span id="passedCount">(0)</span></button>';
    content += '<button class="tabButton" data-passed=true data-failed=true data-action="changeTableContentMode">All <span id="totalCount">(0)</span></button>';
    content += '</div>';

    content += '<div>';

    content += '<button id="removeProjectButton" class="tabButtonProject" data-action="removeProject"><i class="far fa-trash-alt"></i></button>';
    content += '<button id="editProjectButton" class="tabButtonProject" data-action="editProject"><i class="far fa-edit"></i></button>';
    content += '<button id="addProjectButton" class="tabButtonProject" data-action="addProject"><i class="fas fa-plus"></i></button>';

    content += '<select id="projectSelect" class="tabSelectProject" data-action="changeProject">';
    content += '<option data-id="-1">All Projects</option>';
    this.imageModel.projects.forEach(function (project) {
        content += that.__createProjectOption(project.id, project.name);
    });

    content += '</select>';
    content += '</div>';
    content += '<div id="tabContent" class="tabcontent"/>';

    this.$container.html($(content));

    // Set data and draw initial table
    this.$tabContent = $('#tabContent');
    this.$table = new Table(this.connector, this.$tabContent, function (data, ignoreComponent, redrawOption) {
        if (redrawOption === 'redrawTable') {
            that.imageModel = data.job.imageMetaInformationModel;
            that.__updateImageSetCount();
            that.__drawTable();
        } else if (redrawOption === 'redrawNone') {
            that.imageModel = data.job.imageMetaInformationModel;
            that.__updateImageSetCount();
        }else {
            that.callback(data, that);
        }
    });

    this.__updateProjectButtonStates();
    this.__updateImageSetCount();
    this.__drawTable();
};

/**
 * Updates the number of item sets for failed, passed and total amount of image sets in the tabs.
 *
 * @private
 */
TabManager.prototype.__updateImageSetCount = function () {
    var selectedProjectId = String($('#projectSelect :selected').data('id'));
    var $failedCountSpan = $('#failedCount');
    var $passedCountSpan = $('#passedCount');
    var $totalCountSpan = $('#totalCount');
    var failedCount = 0;
    var passedCount = 0;
    var totalCount = 0;

    if (selectedProjectId === '-1') {
        this.imageModel.projects.forEach(function (project) {
            failedCount += project.failedCount;
            passedCount += project.passedCount;
            totalCount += project.totalCount;
        });
    } else {
        var selectedProject = this.imageModel.projects.find(function (project) {
            return project.id === selectedProjectId;
        });

        failedCount = selectedProject.failedCount;
        passedCount = selectedProject.passedCount;
        totalCount = selectedProject.totalCount;
    }

    $failedCountSpan.text('(' + failedCount + ')');
    $passedCountSpan.text('(' + passedCount + ')');
    $totalCountSpan.text('(' + totalCount + ')');
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

/**
 * Updates the current state of the editProject and removeProject buttons.
 *
 * @private
 */
TabManager.prototype.__updateProjectButtonStates = function () {
    var currentProjectId = String($('#projectSelect :selected').data('id'));
    var removeProjectButton = $('#removeProjectButton');
    var editProjectButton = $('#editProjectButton');

    //  Disables remove button for "All" and default project
    if (currentProjectId === '-1' || currentProjectId === '0') {
        removeProjectButton.attr('disabled', 'disabled');
        removeProjectButton.addClass('tabProjectButtonDisabled');
    } else {
        removeProjectButton.removeClass('tabProjectButtonDisabled');
        removeProjectButton.removeAttr('disabled');
    }

    //  Disables edit button for "All"
    if (currentProjectId === '-1') {
        editProjectButton.attr('disabled', 'disabled');
        editProjectButton.addClass('tabProjectButtonDisabled');
    } else {
        editProjectButton.removeClass('tabProjectButtonDisabled');
        editProjectButton.removeAttr('disabled');
    }
};