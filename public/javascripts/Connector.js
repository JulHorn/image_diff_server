/**
 * The prototype offers functionality to send requests to the server.
 * **/
var Connector = function () {
};

/* -----  Specialised Request Methods ----- */

/**
 * Gets the currently active job.
 *
 * @param {Function} callback Called when the request is done.
 * **/
Connector.prototype.getActiveJob = function (callback) {
    this.sendRequest('/', 'GET', null, callback);
};

/**
 * Deletes an image set.
 *
 * @param {String} id The id of the image set to be deleted.
 * @param {Function} callback Called when the request is done.
 * **/
Connector.prototype.delete = function (id, callback) {
    this.sendRequest('/' + id, 'DELETE', null, callback);
};

/**
 * Calculates the diff images for all images. Does not wait until the computation is done.
 *
 * @param {Function} callback Called when the request is done.
 * **/
Connector.prototype.refreshAll = function (callback) {
    this.sendRequest('/checkAll', 'POST', null, callback);
};

/**
 * Makes a new image to a reference image.
 *
 * @param {String} id The id of the image set for which the new image should be made the reference image.
 * @param {Function} callback Called when the request is done.
 * **/
Connector.prototype.makeToNewReferenceImage = function (id, callback) {
    this.sendRequest('/' + id + '/makeToNewReferenceImage', 'PUT', null, callback);
};

/**
 * Returns the image set with the given id.
 *
 * @param {String} id The id of the image set which should be retrieved.
 * @param {Function} callback Called when the request is done. Has the image set as parameter.
 * **/
Connector.prototype.getImageSet = function (id, callback) {
    this.sendRequest('/' + id + '/getImageSet', 'GET', null, callback);
};

/**
 * Modifies the ignore areas of an image set.
 *
 * @param {String} id The id for which the ignore areas should be modified.
 * @param {Object[]} ignoreAreas An array of ignore areas.
 * @param {Function} callback Called when the request is done.
 * **/
Connector.prototype.modifyIgnoreAreas = function (id, ignoreAreas, callback) {
    console.log('Ignore areas:', ignoreAreas);
    this.sendRequest('/' + id + '/modifyIgnoreAreas', 'PUT', { ignoreAreas: ignoreAreas }, callback);
};

/**
 * ToDo
 * @param name
 * @param callback
 */
Connector.prototype.addProject = function (name, callback) {
    this.sendRequest('/addProject', 'POST', { name: name }, callback);
};

/**
 * ToDo
 * @param id
 * @param newName
 * @param callback
 */
Connector.prototype.editProject = function (newName, id, callback) {
    this.sendRequest('/' + id + '/editProject', 'PUT', { name: newName }, callback);
};

/**
 * ToDo
 * @param id
 * @param callback
 */
Connector.prototype.removeProject = function (id, callback) {
    this.sendRequest('/' + id + '/removeProject', 'DELETE', null, callback);
};

/* ----- General Methods ----- */

/**
 * Sends an ajax request.
 *
 * @param {String} url The url to which the request will be send.
 * @param {String} method The request method. 'POST', 'GET', ...
 * @param {Object} data The data which should be send in the body.
 * @param {Function} callback Called when the request is done. Has the data as parameter if the call was a success, else the message.
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
 * @return {String} Returns the server endpoint/host to which the requests will be send.
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
 * @param {String} endpoint The endpoint/host to be saved.
 * **/
Connector.prototype.setServerEndpoint = function (endpoint) {
    localStorage.imageDiffServerEndpoint = endpoint;
};