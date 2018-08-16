class JSONResponse extends Response {
	constructor(data, status, options) {
		options = Object.assign({}, options);
		options.status = status;
		options.headers = Object.assign({}, options.headers, {'content-type': 'application/json'});
		super(JSON.stringify(data), options);
	}
}

module.exports = JSONResponse;