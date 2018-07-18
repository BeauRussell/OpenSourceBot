const baseWaitMS = 500;

module.exports = function (func, tries) {
	let maxTries = tries || 3;
	return function (...args) {
		// Assume cb is the last parameter
		const cb = args[args.length - 1];
		let numTries = 0;
		const makeCall = function () {
			func(...args, function (err, ...results) {
				numTries++;
				if (err) {
					console.log('Retrying ' + numTries + ' ' + func.toString().slice(0, 20));
					if (numTries < maxTries) {
						return setTimeout(function () {
							makeCall();
						// 500ms, 1sec, 2sec +- 10%
						}, Math.pow(2, numTries - 1) * baseWaitMS * (0.9 + Math.random() * 0.1));
					}
				}
				cb(err, ...results);
			});
		};
		makeCall();
	};
};
