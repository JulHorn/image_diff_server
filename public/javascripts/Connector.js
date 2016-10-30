var Connector = function () {
};

Connector.prototype.delete = function (id, callback) {
    this.sendRequest('/'+ id, 'DELETE', null, callback);
};

Connector.prototype.refreshAll = function (callback) {
    this.sendRequest('/refreshAll', 'POST', null, callback);
};

Connector.prototype.makteToNewReferenceImage = function (id, callback) {
    this.sendRequest('/' + id + '/makeToNewReferenceImage', 'PUT', null, callback);
};

Connector.prototype.sendRequest = function (url, method, data, callback) {
    var serverEndpoint = this.getServerEndpoint() + '/api' + url
    console.log('Attempting a request to ' + url + ' with method ' + method);

    $.ajax({
        method: method,
        url: serverEndpoint,
        data: data
    })
    .done(function (data) {
        console.log('Request was successfull: ', url, method, data);

        if(typeof data.data === 'undefined' || data.data === null){
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

Connector.prototype.getServerEndpoint = function () {
    if(!localStorage.imageDiffServerEndpoint){
        localStorage.imageDiffServerEndpoint = "http://127.0.0.1:3000";
    }

    return localStorage.imageDiffServerEndpoint;
}

Connector.prototype.setServerEndpoint = function (endpoint) {
    localStorage.imageDiffServerEndpoint = endpoint;
}