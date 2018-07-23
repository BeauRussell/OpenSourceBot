const getParser = require('@streammedev/parse-message');
const pino = require('pino')();
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');
momentDurationFormatSetup(moment);
const streamme = require('./streamme.js');
const openWS = require('./websocket');

module.exports = function (botKey, botSecret, publicId) {
	const roomId = `user:${publicId}:web`;
	getParser(roomId, function (err, parseMessage) {
		if (err) {
			pino.error('Could not get parser manifest');
			return;
		}
		streamme.botAuth(botKey, botSecret, function (err, token) {
			if (err) {
				pino.error('Could not authenticate bot', {err: err});
				return;
			}
			streamme.retrieveUserSlug(publicId, function (err, channelSlug) {
				if (err) {
					pino.error('Could not retrieve userSlug', {err: err});
					return;
				}
				openWS(roomId, parse);

				const commands = {
					'!bot': 'You can set up your own bot at: https://github.com/BeauRussell/OpenSourceBot',
					'!commands': '!emotes, !flip, !fix, !contest, !followage, !uptime, !coinflip',
					'!emotes': 'Upload your own emotes! https://www.stream.me/settings/chat',
					'!flip': '(╯°□°）╯︵ ┻━┻',
					'!fix': '┬──┬ ノ( ゜-゜ノ)',
					'!contest': 'View my rank on the Top Streamer Leaderboard! https://www.stream.me/contest',
					'!followage': followAge,
					'!uptime': uptime,
					'!coinflip': coinflip
				};

				function parse (data) {
					const message = parseMessage(data);
					const chat = message.message;
					if (chat in commands) {
						responds(chat, message.actor.slug);
					}
				}

				function responds (key, userSlug) {
					if (typeof commands[key] === 'string') {
						streamme.sendMessage(commands[key], token, roomId);
					} else {
						commands[key](userSlug);
					}
				}

				function followAge (userSlug) {
					streamme.followAge(userSlug, channelSlug, function (err, followStart) {
						if (err) {
							pino.error('Could not find followAge', {user: userSlug, channel: channelSlug});
							return;
						}
						if (!followStart) {
							streamme.sendMessage('@' + userSlug + ' is not following this channel.', token, roomId);
							return;
						}
						const msFollow = moment().utc().subtract(followStart);
						const timingInMS = msFollow.valueOf();
						const timing = moment.duration(timingInMS).format();
						streamme.sendMessage('@' + userSlug + ' has been following this channel for: ' + timing, token, roomId);
					});
				}

				function uptime (userSlug) {
					streamme.uptime(publicId, function (err, lastStarted) {
						if (err) {
							pino.error('Could not find uptime', {channelSlug});
							return;
						}
						if (!lastStarted) {
							streamme.sendMessage('This channel is not currently live.', token, roomId);
							return;
						}
						const msLive = moment().utc.subtract(lastStarted, 'milliseconds');
						const timing = moment.duration(msLive).format();
						streamme.sendMessage('This channel has been live for: ' + timing);
					});
				}

				function coinflip (userSlug) {
					if (Math.random() > 0.5) {
						streamme.sendMessage('Heads!');
					} else {
						streamme.sendMessage('Tails!');
					}
				}
			});
		});
	});
};
