const smRequest = require('../lib/smRequest.js');
const request = require('request');
const pino = require('pino')();
const retry = require('../lib/retry.js');

module.exports = {
	botAuth: retry(function (botKey, botSecret, cb) {
		smRequest({
			method: 'POST',
			uri: '/api-auth/v1/login-bot',
			body: {
				key: botKey,
				secret: botSecret
			}
		}, function (err, res, body) {
			if (err) {
				pino.error('Error sending bot Authentication', {err: err});
				return cb(err);
			}
			if (res.statusCode >= 400) {
				pino.error('Could not authenticate bot', {code: res.statusCode, body: body});
				return cb(new Error('Could not authenticate: non 200 response'));
			}
			const botToken = body.access_token;
			cb(null, botToken);
		});
	}),

	retrieveUserSlug: retry(function (publicId, cb) {
		smRequest({
			uri: `/api-user/v1/users/${publicId}/channel`
		}, function (err, res, body) {
			if (err) {
				pino.error("Error requesting channel's userSlug", {err: err});
				return cb(err);
			}
			if (res.statusCode >= 400) {
				pino.error("Could not retrieve channel's userSlug", {code: res.statusCode, body: body});
				return cb(new Error('Could not retrieve userSlug'));
			}
			cb(null, body.slug);
		});
	}),

	sendMessage: function (sendMessage, token, roomId) {
		if (!sendMessage || typeof sendMessage !== 'string') {
			pino.error('Error sending message, passed in message is not a string: ' + sendMessage);
			return;
		}
		smRequest({
			method: 'POST',
			uri: `/api-commands/v1/room/${roomId}/command/say`,
			headers: {
				Authorization: `Bearer ${token}`
			},
			body: {
				message: sendMessage
			}
		}, function (err, res, body) {
			if (err) {
				pino.error('Error sending message to api-commands: ', {err: err});
				return;
			}
			if (res.statusCode >= 400) {
				pino.error('Could not post message to api-commands: ', {code: res.statusCode, body: body});
			}
		});
	},

	followAge: function (userSlug, channelSlug, cb) {
		smRequest({
			uri: `/api-user/v2/${userSlug}/follow/${channelSlug}`
		}, function (err, res, body) {
			if (err) {
				pino.error('Error requesting follow date created', {err: err});
				return cb(err);
			}
			// If this enpoint 404's, the user doesn't follow the target, anything else is an error
			if (res.statusCode === 404) {
				return cb(null, false);
			}
			if (res.statusCode >= 400) {
				pino.error('Could not retrieve follow date created', {code: res.statusCode, body: body});
				return cb(new Error('Could not retrieve follow creation'));
			}
			let followStart = new Date(body.created);
			followStart = Date.parse(followStart);
			cb(null, followStart);
		});
	},

	uptime: function (publicId, cb) {
		request({
			url: `https://www.stream.me/api-channel/v1/channels?publicIds=${publicId}`,
			json: true
		}, function (err, res, body) {
			if (err) {
				pino.error("Error requesting channel's time live", {err: err});
				return cb(err);
			}
			if (res.statusCode >= 400) {
				pino.error("Could not retrieve channel's time live", {code: res.statusCode, body: body});
				return cb(new Error('Could not retireve time live'));
			}
			const info = body[0].streams[0];
			if (info.active) {
				cb(null, info.lastStarted);
			} else {
				cb(null, false);
			}
		});
	}
};
