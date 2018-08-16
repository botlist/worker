const JSONResponse = require('./json');
const Errors = require('../utils').Constants.Errors;

class JSONError extends JSONResponse {
	constructor(status, message, code, options) {
		if (!code) {code = 0;}
		if (!message) {
			message = (code) ? Errors.Codes[code] : Errors.StatusCodes[status];
			message = message || Errors.StatusCodes[500];
		}
		super({status, code, message}, status, options);
	}
}

module.exports = JSONError;