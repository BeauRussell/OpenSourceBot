const request = require('request');
const pino = require('pino')();

module.exports = function (data, cb) {
	data.method = data.method || 'GET';
	data.uri = 'https://www.stream.me' + data.uri;
	data.json = data.json || true;
	request(data, function (err, res, body) {
		if (err) {
			pino.error('Error accessing url', {uri: data.uri});
			return cb(err);
		}
		if (res.statusCode >= 400) {
			const err = new Error('Unexpected Response from ' + data.uri);
			err.code = res.statusCode;
			pino.error(err);
			return cb(err, body);
		}
		cb(null, body);
	});
};
