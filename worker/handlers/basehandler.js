const JSONError = require('../responses').JSONError;

class BaseHandler {
	constructor(eventHandler) {
		this.eventHandler = eventHandler;
	}

	handle(request) {
		const method = this[`_${request.method.toLowerCase()}`];
		return (method) ? method.call(this, request) : new JSONError(405);
	}
}

module.exports = BaseHandler;