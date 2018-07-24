const getParser = require('@streammedev/parse-message');
const pino = require('pino')();
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');
momentDurationFormatSetup(moment);
const streamme = require('./streamme.js');
const openWS = require('./websocket');

let index = module.exports = {};

index.followAge = function (userSlug, publicId, channelSlug, cb) {
	streamme.followAge(userSlug, channelSlug, function (err, followStart) {
		if (err && !err.code) {
			pino.error('Could not find followAge', {user: userSlug, channel: channelSlug});
			return cb(new Error('Could not find follow age'));
		}
		if (!followStart) {
			return cb(null, '@' + userSlug + ' is not following this channel.');
		}
		const msFollow = moment().utc().subtract(followStart);
		const timingInMS = msFollow.valueOf();
		const timing = moment.duration(timingInMS).format();
		cb(null, '@' + userSlug + ' has been following this channel for: ' + timing);
	});
};

index.uptime = function (userSlug, publicId, channelSlug, cb) {
	streamme.uptime(publicId, function (err, lastStarted) {
		if (err && !err.code) {
			pino.error('Could not find uptime', {channelSlug});
			return cb(new Error('Could not find uptime'));
		}
		if (!lastStarted) {
			return cb(null, 'This channel is not currently live.');
		}
		const msLive = moment().utc.subtract(lastStarted, 'milliseconds');
		const timing = moment.duration(msLive).format();
		cb(null, 'This channel has been live for: ' + timing);
	});
};

index.coinflip = function (userSlug, publicId, channelSlug, cb) {
	if (Math.random() > 0.5) {
		cb(null, 'Heads!');
	} else {
		cb(null, 'Tails!');
	}
};

const commands = {
	'!bot': 'You can set up your own bot at: https://github.com/BeauRussell/OpenSourceBot',
	'!commands': '!emotes, !flip, !fix, !contest, !followage, !uptime, !coinflip',
	'!emotes': 'Upload your own emotes! https://www.stream.me/settings/chat',
	'!flip': '(╯°□°）╯︵ ┻━┻',
	'!fix': '┬──┬ ノ( ゜-゜ノ)',
	'!contest': 'View my rank on the Top Streamer Leaderboard! https://www.stream.me/contest',
	'!followage': index.followAge,
	'!uptime': index.uptime,
	'!coinflip': index.coinflip
};

index.responds = function (message, options) {
	const chat = message.message;
	if (typeof commands[chat] === 'string') {
		streamme.sendMessage(commands[chat], options);
	} else if (typeof commands[chat] === 'function') {
		commands[chat](message.actor.slug, options.publicId, options.channelSlug, function (err, message) {
			if (err) {
				pino.error('Issue receiving messsage to send', {err: err});
				return;
			}
			streamme.sendMessage(message, options);
		});
	}
};

index.run = function (botKey, botSecret, publicId) {
	const roomId = `user:${publicId}:web`;
	getParser(roomId, function (err, parseMessage) {
		if (err) {
			pino.error('Could not get parser manifest');
			process.exit(1);
		}
		streamme.botAuth(botKey, botSecret, function (err, token) {
			if (err) {
				pino.error('Could not authenticate bot', {err: err});
				process.exit(1);
			}
			streamme.retrieveUserSlug(publicId, function (err, channelSlug) {
				if (err) {
					pino.error('Could not retrieve userSlug', {err: err});
					process.exit(1);
				}
				const options = {
					token: token,
					channelSlug: channelSlug,
					roomId: roomId,
					publicId: publicId
				};
				openWS(roomId, parseMessage, function (message) {
					index.responds(message, options);
				});
			});
		});
	});
};
