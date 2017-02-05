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

    this.components.push(new Header(this.connector, function (data) {
        that.__notify(data);
    }));
    this.components.push(new Table(this.connector, function (data) {
        that.__notify(data);
    }));
};

/**
 * Distributes change information to all registered ui elements
 * via the elements draw method.
 *
 * @param data The data which will be distritbuted
 * **/
ChangeNotificator.prototype.__notify = function (data) {
    this.components.forEach(function (component) {
        component.draw(data);
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