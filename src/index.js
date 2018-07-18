const WebSocket = require('ws');
const getParser = require('@streammedev/parse-message');
const pino = require('pino')();
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');
momentDurationFormatSetup(moment);
const streamme = require('./util/streamme.js');

const wsTimeoutMultiplier = 2;

module.exports = function (botKey, botSecret, publicId) {
	const roomId = `user:${publicId}:web`;
	getParser(roomId, function (err, parseMessage) {
		if (err) {
			pino.error(err);
			return;
		}
		streamme.botAuth(botKey, botSecret, function (err, token) {
			if (err) {
				pino.error(err);
				return;
			}
			streamme.retrieveUserSlug(function (err, channelSlug) {
				if (err) {
					pino.error(err);
					return;
				}
				openWS(roomId);

				const commands = {
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
					streamme.followAge(userSlug, channelSlug, function (followStart) {
						if (!followStart) {
							streamme.sendMessage('@' + userSlug + ' is not following this channel.', token, roomId);
						}
						const msFollow = moment().utc().subtract(followStart);
						const timingInMS = msFollow.valueOf();
						const timing = moment.duration(timingInMS).format();
						streamme.sendMessage('@' + userSlug + ' has been following this channel for: ' + timing, token, roomId);
					});
				}

				function uptime (userSlug) {
					streamme.uptime(publicId, function (lastStarted) {
						if (!lastStarted) {
							streamme.sendMessage('This channel is not currently live.', token, roomId);
						}
						const msLive = moment().utc.subtract(lastStarted, 'milliseconds');
						const timing = moment.duration(msLive).format();
						streamme.sendMessage('This channel has been live for: ' + timing, token, roomId);
					});
				}

				function coinflip (userSlug) {
					if (Math.random() > 0.5) {
						streamme.sendMessage('Heads!', token, roomId);
					} else {
						streamme.sendMessage('Tails!', token, roomId);
					}
				}

				let wsTimeout = 250;
				function openWS () {
					const ws = new WebSocket('wss://www.stream.me/api-rooms/v3/ws');
					let isAlive = false;
					ws.on('open', function open () {
						pino.info('Connected and Listening for new messages');
						ws.send(`chat {"action":"join","room":"${roomId}"}`);
						wsTimeout = 10;
						ws.on('pong', heartbeat);
						isAlive = true;
					});

					ws.on('message', function (data, flags) {
						let spaceIndex = data.indexOf(' ');
						const nameSpace = data.slice(0, spaceIndex);
						let dataSlice = data.slice(spaceIndex + 1);
						if (nameSpace !== 'chat') {
							return;
						}
						spaceIndex = dataSlice.indexOf(' ');
						const messageType = dataSlice.slice(0, spaceIndex);
						dataSlice = dataSlice.slice(spaceIndex + 1);
						if (messageType !== 'message') {
							pino.error(data);
							return;
						}

						const rawMessage = JSON.parse(dataSlice);

						if (rawMessage.action === 'join') {
							return;
						}
						if (rawMessage.type !== 'chat') {
							pino.info('Unexpected message type: ' + rawMessage.type);
							return;
						}
						parse(rawMessage.data);
					});

					function noop () {}

					function heartbeat () {
						isAlive = true;
					}

					const interval = setInterval(function ping () {
						if (isAlive === false) {
							clearInterval(interval);
							wsTimeout *= wsTimeoutMultiplier;
							return ws.terminate();
						}
						isAlive = false;
						ws.ping(noop);
					}, 15000);

					ws.on('close', function (reasonCode, description) {
						// retry every 90-100% of the timeout to stagger retries to reduce load
						setTimeout(function () {
							openWS();
						}, Math.min(wsTimeout * (0.9 + Math.random() * 0.1), 30000));
					});

					ws.on('error', function (err) {
						isAlive = false;
						clearInterval(interval);
						wsTimeout *= wsTimeoutMultiplier;
						ws.terminate();
						pino.error('WebSocket connection failed: ' + err);
					});
				}
			});
		});
	});
};
