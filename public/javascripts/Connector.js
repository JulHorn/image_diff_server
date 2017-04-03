/**
 * The prototype offers functionality to send requests to the server.
 * **/
var Connector = function () {
};

/* -----  Specialised Request Methods ----- */

/**
 * Gets the currently active job.
 *
 * @param callback Called when the request is done.
 * **/
Connector.prototype.getActiveJob = function (callback) {
    this.sendRequest('/', 'GET', null, callback);
};

/**
 * Deletes an image set.
 *
 * @param id The id of the image set to be deleted.
 * @param callback Called when the request is done.
 * **/
Connector.prototype.delete = function (id, callback) {
    this.sendRequest('/' + id, 'DELETE', null, callback);
};

/**
 * Calculates the diff images for all images. Does not wait until the computation is done.
 *
 * @param callback Called when the request is done.
 * **/
Connector.prototype.refreshAll = function (callback) {
    this.sendRequest('/checkAll', 'POST', null, callback);
};

/**
 * Makes a new image to a reference image.
 *
 * @param id The id of the image set for which the new image should be made the reference image.
 * @param callback Called when the request is done.
 * **/
Connector.prototype.makeToNewReferenceImage = function (id, callback) {
    this.sendRequest('/' + id + '/makeToNewReferenceImage', 'PUT', null, callback);
};

Connector.prototype.getImageSet = function (id, callback) {
    this.sendRequest('/' + id + '/getImageSet', 'GET', null, callback);
};

Connector.prototype.modifyIgnoreAreas = function (id, ignoreAreas, callback) {
    console.log('Ignore areas:', ignoreAreas);
    this.sendRequest('/' + id + '/modifyIgnoreAreas', 'PUT', { ignoreAreas: ignoreAreas }, callback);
};

/* ----- General Methods ----- */

/**
 * Sends an ajax request.
 *
 * @param url The url to which the request will be send.
 * @param method The request method. 'POST', 'GET', ...
 * @param data The data which should be send in the body.
 * @param callback Called when the request is done. Has the data as parameter if the call was a success, else the message.
 * **/
Connector.prototype.sendRequest = function (url, method, data, callback) {
    var serverEndpoint = this.getServerEndpoint() + '/api' + url;
    console.log('Attempting a request to ' + url + ' with method ' + method + ' and data ' + data);

    $.ajax({
        method: method,
        url: serverEndpoint,
        data: { data: JSON.stringify(data) }
    })
    .done(function (data) {
        console.log('Request was successfull: ', url, method, data);

        if (callback) {
            if (typeof data.data === 'undefined' || data.data === null) {
                callback(data.message);
            }else if (typeof data.data === 'object') {
                callback(data.data);
            } else {
                callback(JSON.parse(data.data));
            }
        }
    })
    .fail(function (data) {
        console.log('Request failure: ', url, method, data);
        callback(data.message);
    });
};

/**
 * Returns the server endpoint/host to which the requests will be send. The value will be retrieved from the local storage.
 *
 * @return Returns the server endpoint/host to which the requests will be send.
 * **/
Connector.prototype.getServerEndpoint = function () {
    if(!localStorage.imageDiffServerEndpoint){
        localStorage.imageDiffServerEndpoint = location.protocol
            + '//' + location.hostname + (location.port ? ':' + location.port : '')
    }

    return localStorage.imageDiffServerEndpoint;
};

/**
 * Sets the server endpoint/host to which the requests will be send. The value will be saved in the local storage.
 *
 * @param endpoint The endpoint/host to be saved.
 * **/
Connector.prototype.setServerEndpoint = function (endpoint) {
    localStorage.imageDiffServerEndpoint = endpoint;
};