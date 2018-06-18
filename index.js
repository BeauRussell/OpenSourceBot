const WebSocket = require('ws');
const request = require('request');
const getParser = require('@streammedev/parse-message');

const botKey = 'ADD THE BOT KEY';
const botSecret = 'ADD THE BOT SECRET';

const publicId = 'ADD THE PUBLIC ID OF THE CHANNEL';
var roomId = `user:${publicId}:web`;

const secondsInMS = 1000;
const minutesInMS = secondsInMS * 60;
const hoursInMS = minutesInMS * 60;
const daysInMS = hoursInMS * 24;
const monthsInMS = daysInMS * 30;
const yearsInMS = daysInMS * 365;

function botAuth (cb) {
	request({
		method: 'POST',
		url: 'https://stream.me/api-auth/v1/login-bot',
		body: {
			key: botKey,
			secret: botSecret
		},
		json: true
	}, function (err, res, body) {
		if (err) {
			console.log(err);
			return;
		}
		const botToken = body.access_token;
		cb(err, botToken);
	});
}

function retrieveUserSlug (cb) {
	request({
		url: `https://www.stream.me/api-user/v1/users/${publicId}/channel`,
		json: true
	}, function (err, res, body) {
		if (err) {
			console.log(err);
		}
		const userSlug = body.slug;
		cb(userSlug);
	});
}

getParser(roomId, function (err, parseMessage) {
	if (err) {
		console.log(err);
		return;
	}
	botAuth(function (err, token) {
		if (err) {
			console.log(err);
			return;
		}
		retrieveUserSlug(function (channelSlug) {
			openWS();

			const commands = {
				'!bot': 'You can start to set up your own chat bot by visiting AWAITING URL',
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
				const role = message.actor.role;
				let chat = message.message;
				const spaceIndex = chat.indexOf(' ');
				let changes;
				if (spaceIndex !== -1) {
					chat = chat.slice(0, spaceIndex);
					changes = message.message.slice(spaceIndex + 1);
				}
				console.log(message);
				if (chat in commands) {
					responds(chat, message.actor.slug, changes, role);
				}
			}

			function responds (key, userSlug, changes, role) {
				if (typeof commands[key] === 'string') {
					sendMessage(commands[key]);
				} else {
					commands[key](userSlug, changes, role);
				}
			}

			function followAge (userSlug, changes, role) {
				request({
					url: `https://stream.me/api-user/v2/${userSlug}/follow/${channelSlug}`,
					json: true
				}, function (err, res, body) {
					if (err) {
						console.log(err);
						return;
					}
					if (res.statusCode === 404) {
						sendMessage('@' + userSlug + ' is not following this channel.');
						return;
					}
					let followStart = new Date(body.created);
					followStart = Date.parse(followStart);
					const msFollow = Date.now() - followStart;
					const timing = formatTime(msFollow);
					sendMessage('@' + userSlug + ' has been following this channel for: ' + timing);
				});
			}

			function uptime (userSlug, changes, role) {
				request({
					url: `https://stream.me/api-channel/v1/channels?publicIds=${publicId}`,
					json: true
				}, function (err, res, body) {
					if (err) {
						console.log(err);
						return;
					}
					const info = body[0].streams[0];
					if (info.active) {
						const msLive = Date.now() - info.lastStarted;
						const timing = formatTime(msLive);
						sendMessage('This channel has been live for: ' + timing);
					} else {
						sendMessage('This channel is not currently live.');
					}
				});
			}

			function coinflip (userSlug, changes, role) {
				if (Math.random() > 0.5) {
					sendMessage('Heads!');
				} else {
					sendMessage('Tails!');
				}
			}

			function formatTime (time) {
				let message = '';
				const years = Math.floor(time / yearsInMS);
				time = time % yearsInMS;
				const months = Math.floor(time / monthsInMS);
				time = time % monthsInMS;
				const days = Math.floor(time / daysInMS);
				time = time % daysInMS;
				const hours = Math.floor(time / hoursInMS);
				time = time % hoursInMS;
				const minutes = Math.floor(time / minutesInMS);
				time = time % minutesInMS;
				const seconds = Math.floor(time / secondsInMS);
				if (years !== 0) {
					if (years === 1) {
						message += years + ' year ';
					} else {
						message += years + ' years ';
					}
				}
				if (months !== 0) {
					if (months === 1) {
						message += months + ' month ';
					} else {
						message += months + ' months ';
					}
				}
				if (days !== 0) {
					if (days === 1) {
						message += days + ' day ';
					} else {
						message += days + ' days ';
					}
				}
				if (hours !== 0) {
					if (hours === 1) {
						message += hours + ' hour ';
					} else {
						message += hours + ' hours ';
					}
				}
				if (minutes !== 0) {
					if (minutes === 1) {
						message += minutes + ' minute ';
					} else {
						message += minutes + ' minutes ';
					}
				}
				if (seconds !== 0) {
					if (seconds === 1) {
						message += seconds + ' second ';
					} else {
						message += seconds + ' seconds ';
					}
				}
				return message;
			}

			function sendMessage (sendMessage) {
				request({
					method: 'POST',
					url: `https://stream.me/api-commands/v1/room/${roomId}/command/say`,
					json: true,
					headers: {
						Authorization: `Bearer ${token}`
					},
					body: {
						message: sendMessage
					}
				}, function (err, res, body) {
					if (err) {
						console.log(err);
						return;
					}
					if (res.statusCode !== 200) {
						console.log(body);
					}
				});
			}

			function openWS () {
				var ws = new WebSocket('wss://stream.me/api-rooms/v3/ws');
				ws.on('open', function open () {
					// TODO: template roomId
					ws.send(`chat {"action":"join","room":"${roomId}"}`);
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
						console.log(data);
						return;
					}

					const rawMessage = JSON.parse(dataSlice);

					if (rawMessage.action === 'join') {
						return;
					}
					if (rawMessage.type !== 'chat') {
						console.log('Unexpected message type: ' + rawMessage.type);
						return;
					}
					parse(rawMessage.data);
				});

				ws.on('close', function (reasonCode, description) {
					openWS();
				});
			}
		});
	});
});
