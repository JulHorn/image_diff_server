import fetch from 'isomorphic-unfetch'

/**
 * Returns the server endpoint/host to which the requests will be send. The value will be retrieved from the local storage.
 *  ToDo: Update documentation with return promise value -> json nad class is probably not needed
 *  ToDo: Update function names
 * **/
class Connector {

	/**
	 * Gets the currently active job.
	 *
	 * **/
	async getActiveJob (imageSetState, projectId) {
		return this.sendRequest('/', 'GET', null, {imageSetState: imageSetState, projectId: projectId});
	};

	/**
	 * Deletes an image set.
	 *
	 * @param {String} id The id of the image set to be deleted.
	 * **/
	async delete (id) {
		return this.sendRequest('/' + id, 'DELETE', null);
	};

	/**
	 * Calculates the diff images for all images. Does not wait until the computation is done.
	 * **/
	async checkAll () {
		return this.sendRequest('/checkAll', 'POST', null);
	};

	/**
	 * Makes a new image to a reference image.
	 *
	 * @param {String} id The id of the image set for which the new image should be made the reference image.
	 * **/
	async setToNewReferenceImage (id) {
		return this.sendRequest('/' + id + '/makeToNewReferenceImage', 'PUT', null);
	};

	/**
	 * Returns the image set with the given id.
	 *
	 * @param {String} id The id of the image set which should be retrieved.
	 * **/
	async getImageSet (id) {
		return this.sendRequest('/' + id + '/getImageSet', 'GET', null);
	};

	/**
	 * Modifies the ignore areas of an image set.
	 *
	 * @param {String} id The id for which the ignore areas should be modified.
	 * @param {Object[]} ignoreAreas An array of ignore areas.
	 * **/
	async modifyIgnoreAreas (id, ignoreAreas) {
		console.log('Ignore areas:', ignoreAreas);
		return this.sendRequest('/' + id + '/modifyIgnoreAreas', 'PUT', { ignoreAreas: ignoreAreas });
	};

	/**
	 * Modifies the check areas of an image set.
	 *
	 * @param {String} id The id for which the check areas should be modified.
	 * @param {Object[]} checkAreas An array of check areas.
	 * **/
	async modifyCheckAreas (id, checkAreas) {
		console.log('Check areas:', checkAreas);
		return this.sendRequest('/' + id + '/modifyCheckAreas', 'PUT', { checkAreas: checkAreas });
	};

	/**
	 * Add/create a project.
	 *
	 * @param {String} name Name of the new project.
	 */
	async addProject (name) {
		return this.sendRequest('/addProject', 'POST', { name: name });
	};

	/**
	 * Edit an existing project.
	 *
	 * @param {String} newName The new name of the project.
	 * @param {String} id Project which should be modified.
	 */
	async editProject (newName, id) {
		return this.sendRequest('/' + id + '/editProject', 'PUT', { name: newName });
	};

	/**
	 * Deletes a project.
	 *
	 * @param {String} id Id of the project to be deleted.
	 */
	async removeProject (id) {
		return this.sendRequest('/' + id + '/removeProject', 'DELETE', null);
	};

	/**
	 * Assign an image set to another project.
	 *
	 * @param {String} imageSetId The id of the image set which should be assigned to another project.
	 * @param {String} projectIdFrom Id of the current project.
	 * @param {String} projectIdTo Id of the project it should be assigned to.
	 */
	async assignImageSetToProject (imageSetId, projectIdFrom, projectIdTo) {
		return this.sendRequest('/' + imageSetId + '/assignImageSetToProject', 'PUT', { projectIdFrom : projectIdFrom, projectIdTo: projectIdTo });
	};

	/**
	 * ToDo: Documentation
	 *
	 * @param url
	 * @param method
	 * @param bodyData
	 * @param queryData
	 * @returns {Promise<Promise<T | never>>}
	 */
	async sendRequest (url, method, bodyData, queryData) {

		let query = '';

		for (let objProp in queryData) {
			const objValue = queryData[objProp];

			if (!objValue || objValue === 'undefined') { continue; }

			if (query.length === 0) {
				query += '?' + objProp + '=' + objValue;
			} else {
				query += '&' + objProp + '=' + objValue;
			}
		}

		console.log('query', query);

		return fetch(this.getServerEndpoint() + url + query, {method: method, headers: {'Content-Type': 'application/json', body: bodyData}})
			.then( resp => resp.json());
	}

	/**
	 * ToDo Proper implementation
	 * @returns {string}
	 */
	getServerEndpoint () {
		return 'http://localhost:3001/api/'
			// return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')
	}
}

export default new Connector();