class HTMLResponse extends Response {
	constructor(data, options) {
		options = Object.assign({}, options);
		options.headers = Object.assign({}, options.headers, {'content-type': 'text/html'});
		super(data, options);
	}
}

module.exports = HTMLResponse;