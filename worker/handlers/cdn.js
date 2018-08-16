const BaseHandler = require('./basehandler');
const Responses = require('../responses');

class CDNHandler extends BaseHandler {
	fetchStorage(request) {
		const url = new URL(request.url);
		return fetch(`https://storage.googleapis.com/${this.eventHandler.bucket}/${url.pathname}`, request).then((resp) => {
			const response = new Response(resp.body, resp);
			response.headers.set('access-control-allow-origin', '*');
			return response;
		});
	}

	_head(request) {
		return this.fetchStorage(request);
	}

	_options(request) {
		return this.fetchStorage(request);
	}

	_get(request) {
		return this.fetchStorage(request).then((response) => {
			if (200 <= response.status && response.status < 300) {
				return response;
			}
			return new Responses.JSONError(response.status, response.statusText);
		});
	}
}

module.exports = CDNHandler;