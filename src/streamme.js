const smRequest = require('../lib/smRequest.js');
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
		}, function (err, body) {
			if (err) {
				return cb(err);
			}
			const botToken = body.access_token;
			cb(null, botToken);
		});
	}),

	retrieveUserSlug: retry(function (publicId, cb) {
		smRequest({
			uri: `/api-user/v1/users/${publicId}/channel`
		}, function (err, body) {
			if (err) {
				return cb(err);
			}
			cb(null, body.slug);
		});
	}),

	sendMessage: function (sendMessage, options, cb) {
		if (!sendMessage || typeof sendMessage !== 'string') {
			pino.error('Error sending message, passed in message is not a string: ' + sendMessage);
			return;
		}
		smRequest({
			method: 'POST',
			uri: `/api-commands/v1/room/${options.roomId}/command/say`,
			headers: {
				Authorization: `Bearer ${options.token}`
			},
			body: {
				message: sendMessage
			}
		}, function (err, body) {
			if (err) {
				pino.error('Error sending message to api-commands: ', {err: err});
			}
		});
	},

	followAge: function (userSlug, channelSlug, cb) {
		smRequest({
			uri: `/api-user/v2/${userSlug}/follow/${channelSlug}`
		}, function (err, body) {
			if (err) {
				// If this enpoint 404's, the user doesn't follow the target, anything else is an error
				if (err.code === 404) {
					return cb(null, false);
				} else {
					pino.error('Error requesting follow date created', {err: err});
					return cb(err);
				}
			}
			let followStart = new Date(body.created);
			followStart = Date.parse(followStart);
			cb(null, followStart);
		});
	},

	uptime: function (publicId, cb) {
		smRequest({
			url: `/api-channel/v1/channels?publicIds=${publicId}`,
			json: true
		}, function (err, body) {
			if (err) {
				pino.error("Error requesting channel's time live", {err: err});
				return cb(err);
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
