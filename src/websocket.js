const WebSocket = require('ws');
const pino = require('pino')();

let wsTimeout = 250;
const wsTimeoutMultiplier = 2;

module.exports = function openWS (roomId, parse) {
	const ws = new WebSocket('wss://www.stream.me/api-rooms/v3/ws');
	let isAlive = false;
	ws.on('open', function open () {
		pino.info('Connected and Listening for new messages');
		ws.send(`chat {"action":"join","room":"${roomId}"}`);
		wsTimeout = 250;
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
};
