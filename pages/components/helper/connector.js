/**
 * Returns the server endpoint/host to which the requests will be send. The value will be retrieved from the local storage.
 *
 * @return {String} Returns the server endpoint/host to which the requests will be send.
 * **/
class Connector {
	getServerEndpoint() {
			return location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')
	}
}

export default new Connector();