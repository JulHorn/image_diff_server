var Connector = function () {
    this.baseUrl = 'http://127.0.0.1:3000/api';
};

Connector.prototype.delete = function (id, callback) {
    this.sendRequest(this.baseUrl + '/'+ id, 'DELETE', null, callback);
};

Connector.prototype.refreshAll = function (callback) {
    this.sendRequest(this.baseUrl + '/refreshAll', 'POST', null, callback);
};

Connector.prototype.makteToNewReferenceImage = function (id, callback) {
    this.sendRequest(this.baseUrl + '/' + id + '/makeToNewReferenceImage', 'PUT', null, callback);
};

Connector.prototype.sendRequest = function (url, method, data, callback) {
    $.ajax({
        method: method,
        url: url,
        data: data
    })
    .done(function (data) {
        console.log('Request was successfull: ', url, method, data);

        if(typeof data.data === undefined || data.data === null){
            callback(data.message);
        } else {
            callback(JSON.parse(data.data));
        }

    })
    .fail(function (data) {
        console.log('Request failure: ', url, method, data);
        callback(data.message);
    });
};