const JSONError = require('./responses').JSONError;

const Handlers = require('./handlers');

class EventHandler {
	constructor(options) {
		options = Object.assign({}, options);

		this.handlers = [
			{hostnames: ['www.botlist.gg', 'botlist.gg'], handler: new Handlers.Site(this)},
			{hostnames: ['cdn.botlist.gg'], handler: new Handlers.CDN(this)}
		];
	}

	fetchResponse(request) {
		return Promise.resolve().then(() => {
			const url = new URL(request.url);
			const handler = (this.handlers.find((handler) => handler.hostnames.includes(url.hostname)) || {}).handler;

			return (handler) ? handler.handle(request) : new JSONError(400, '???');
		}).catch((e) => new JSONError(500, e.message, e.code));
	}

	//do not use respondWith if you want to let the request go through
	onFetch(event) {
		event.respondWith(this.fetchResponse(event.request));
	}

	run() {
		addEventListener('fetch', this.onFetch.bind(this));
	}
}

module.exports = EventHandler;