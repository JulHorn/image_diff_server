/**
 * Constructor.
 * **/
var ChangeNotificator = function () {
    this.components = [];
    this.connector = new Connector();

    this.registerComponents();
    this.__init();
};

/* ----- Methods ----- */

ChangeNotificator.prototype.registerComponents = function () {
    var that = this;

    this.components.push(new Header(this.connector, function (data) {
        that.__notify(data);
    }));
    this.components.push(new Table(this.connector, function (data) {
        that.__notify(data);
    }));
};

ChangeNotificator.prototype.__notify = function (data) {
    this.components.forEach(function (component) {
        component.draw(data);
    });
};

ChangeNotificator.prototype.__init = function () {
    var that = this;

    this.connector.getActiveJob(function (data) {
        that.__notify(data);
    });
};