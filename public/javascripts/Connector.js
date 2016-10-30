var Connector = function () {
    this.baseUrl = 'http://127.0.0.1:3000/api';
};

Connector.prototype.delete = function (id, callback) {
    this.sendRequest(this.baseUrl + '/'+ id, 'DELETE', null, callback);
};

Connector.prototype.sendRequest = function (url, method, data, callback) {
    $.ajax({
        method: method,
        url: url,
        data: data
    })
    .done(function (data) {
        console.log('Request was successfull: ', url, method, data);
        callback(JSON.parse(data.data));
    })
    .fail(function (data) {
        console.log('Request failure: ', url, method, data);
        callback(JSON.parse(data.message));
    });
};