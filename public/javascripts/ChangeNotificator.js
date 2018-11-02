/**
 * Creates the ui elements and notifies those elements,
 * if something changed.
 * **/
var ChangeNotificator = function () {
    this.components = [];
    this.connector = new Connector();

    this.__registerComponents();
    this.__init();
};

/* ----- Methods ----- */

/**
 * Registers the ui elements to the notificator.
 * **/
ChangeNotificator.prototype.__registerComponents = function () {
    var that = this;

    this.components.push(new Header(this.connector, function (data, ignoreComponent) {
        that.__notify(data, ignoreComponent);
    }));

    this.components.push(new TabManager(this.connector, function (data, ignoreComponent) {
        that.__notify(data, ignoreComponent);
    }));
};

/**
 * Distributes change information to all registered ui elements
 * via the elements draw method.
 *
 * @param {Object} data The data which will be distributed
 * @param {Object} ignoreComponent A component which should not be redrawn. E.g. Header or table.
 * **/
ChangeNotificator.prototype.__notify = function (data, ignoreComponent) {
    this.components.forEach(function (component) {
        if(component !== ignoreComponent) {
            component.draw(data.job);
        }
    });
};

/**
 * Gets information about the current job when the page is loaded
 * and and distributes that information to the ui elements.
 * **/
ChangeNotificator.prototype.__init = function () {
    var that = this;

    this.connector.getActiveJob(function (data) {
        that.__notify(data);
    });
};