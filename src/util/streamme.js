const request = require('request');
const pino = require('pino')();
const retry = require('../../lib/retry.js');

module.exports = {
	botAuth: retry(function (botKey, botSecret, cb) {
		request({
			method: 'POST',
			url: 'https://www.stream.me/api-auth/v1/login-bot',
			body: {
				key: botKey,
				secret: botSecret
			},
			json: true
		}, function (err, res, body) {
			if (err) {
				pino.error(err);
				return;
			}
			if (res.statusCode !== 200) {
				pino.error('Could not authenticate bot: Did not receive 200 http status, instead was: ', res.statusCode, ' body: ', body);
				return cb(new Error('Could not authenticate: non 200 response'));
			}
			const botToken = body.access_token;
			cb(err, botToken);
		});
	}),

	retrieveUserSlug: retry(function (publicId, cb) {
		request({
			url: `https://www.stream.me/api-user/v1/users/${publicId}/channel`,
			json: true
		}, function (err, res, body) {
			if (err) {
				pino.error(err);
			}
			cb(null, body.slug);
		});
	}),

	sendMessage: function (sendMessage, token, roomId) {
		request({
			method: 'POST',
			url: `https://www.stream.me/api-commands/v1/room/${roomId}/command/say`,
			json: true,
			headers: {
				Authorization: `Bearer ${token}`
			},
			body: {
				message: sendMessage
			}
		}, function (err, res, body) {
			if (err) {
				pino.error(err);
				return;
			}
			if (res.statusCode !== 200) {
				pino.error('Could not post message to api-commands: ', body);
			}
		});
	},

	followAge: function (userSlug, channelSlug, cb) {
		request({
			url: `https://www.stream.me/api-user/v2/${userSlug}/follow/ryokif`,
			json: true
		}, function (err, res, body) {
			if (err) {
				pino.error(err);
				return;
			}
			if (res.statusCode === 404) {
				cb();
				return;
			}
			let followStart = new Date(body.created);
			followStart = Date.parse(followStart);
			cb(followStart);
		});
	},

	uptime: function (publicId, cb) {
		request({
			url: `https://www.stream.me/api-channel/v1/channels?publicIds=006d1a3c-3775-4428-97a7-3166009a9853`,
			json: true
		}, function (err, res, body) {
			if (err) {
				pino.error(err);
				return;
			}
			const info = body[0].streams[0];
			if (info.active) {
				cb(info.lastStarted);
			} else {
				cb();
			}
		});
	}
};
