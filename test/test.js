/* global it,describe */

const assert = require('assert');
const nock = require('nock');
const index = require('../src/index.js');
const streamme = require('../src/streamme');

const userSlug = 'yourknightmares';
const channelSlug = 'streamme';
const channelId = '4882ff3e-47cd-48c9-8bb7-858eca571710';

describe('index.js', function () {
	describe('followAge', function () {
		it('returns a correct value on success', function (done) {
			nockFollowAgeSuccess();
			index.followAge(userSlug, channelId, channelSlug, function (err, message) {
				assert(!err);
				assert(typeof message === 'string');
				assert(message === '@yourknightmares has been following this channel for: 1 year, 5 months, 26 days');
				done();
			});
		});

		it('returns a correct value when not following', function (done) {
			nockFollowAge404();
			// User cannot follow themselves, so hit the endpoint asking for that
			index.followAge(userSlug, channelId, userSlug, function (err, message) {
				assert(!err);
				assert(typeof message === 'string');
				assert(message === '@yourknightmares is not following this channel.');
				done();
			});
		});
	});

	describe('coinflip', function () {
		it('successfully passes back a string with the side of a coin', function (done) {
			index.coinflip(userSlug, channelId, channelSlug, function (err, message) {
				assert(!err);
				assert(typeof message === 'string');
				assert(message === 'Heads!' || message === 'Tails!');
				done();
			});
		});
	});
});

describe('streamme.js', function () {
	describe('botAuth', function () {
		it('successfully authorizes the bot and returns a the token', function (done) {
			nockBotAuthSuccess();
			streamme.botAuth('FFF', 'AAA', function (err, token) {
				assert(!err);
				assert(typeof token === 'string');
				assert(token === 'QQQ');
				done();
			});
		});
	});

	describe('userSlug', function () {
		it('successfully retrieves the userSlug', function (done) {
			nockUserSlugSuccess();
			streamme.retrieveUserSlug(channelId, function (err, slug) {
				assert(!err);
				assert(typeof slug === 'string');
				assert(slug === 'yourknightmares');
				done();
			});
		});
	});

	describe('sendMessage', function () {

	});
});

function nockFollowAgeSuccess () {
	nock('https://www.stream.me:443', {'encodedQueryParams': true})
  .get('/api-user/v2/yourknightmares/follow/streamme')
  .reply(200, {'notify': 1, 'created': '2017-02-03T17:51:27.000Z'}, [ 'Date',
	'Tue, 31 Jul 2018 15:39:43 GMT',
	'Content-Type',
	'application/json; charset=utf-8',
	'Transfer-Encoding',
	'chunked',
	'Connection',
	'close',
	'Set-Cookie',
	'__cfduid=db270fcc08e59f1f7d62490b34171cf961533051583; expires=Wed, 31-Jul-19 15:39:43 GMT; path=/; domain=.stream.me; HttpOnly',
	'Vary',
	'Accept-Encoding',
	'ETag',
	'W/"31-62a005fe"',
	'X-Proxy-Read-Timeout',
	'20s',
	'X-Frame-Options',
	'SAMEORIGIN',
	'Strict-Transport-Security',
	'max-age=15552000; includeSubDomains',
	'X-Content-Type-Options',
	'nosniff',
	'X-XSS-Protection',
	'1; mode=block',
	'Expect-CT',
	'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
	'Server',
	'cloudflare',
	'CF-RAY',
	'443128cc79ec586d-DFW' ]);
}

function nockFollowAge404 () {
	nock('https://www.stream.me:443', {'encodedQueryParams': true})
  .get('/api-user/v2/yourknightmares/follow/yourknightmares')
  .reply(404, '', [ 'Date',
	'Tue, 31 Jul 2018 15:38:37 GMT',
	'Content-Length',
	'0',
	'Connection',
	'close',
	'Set-Cookie',
	'__cfduid=d369ffd6161ad53e1feb6848f5ba387ce1533051517; expires=Wed, 31-Jul-19 15:38:37 GMT; path=/; domain=.stream.me; HttpOnly',
	'Strict-Transport-Security',
	'max-age=15552000; includeSubDomains',
	'X-Content-Type-Options',
	'nosniff',
	'Expect-CT',
	'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
	'Server',
	'cloudflare',
	'CF-RAY',
	'443127324f9a58af-DFW' ]);
}

function nockBotAuthSuccess () {
	nock('https://www.stream.me:443', {'encodedQueryParams': true})
  .post('/api-auth/v1/login-bot', {'key': 'FFF', 'secret': 'AAA'})
  .reply(200, {'token_type': 'bearer', 'access_token': 'QQQ', 'expires_in': 129600}, [ 'Date',
	'Tue, 31 Jul 2018 18:17:42 GMT',
	'Content-Type',
	'application/json; charset=utf-8',
	'Transfer-Encoding',
	'chunked',
	'Connection',
	'close',
	'Set-Cookie',
	'__cfduid=d17b96a56a3b9b9a184d548d9614f0c9b1533061061; expires=Wed, 31-Jul-19 18:17:41 GMT; path=/; domain=.stream.me; HttpOnly',
	'Vary',
	'Accept-Encoding',
	'X-Proxy-Read-Timeout',
	'20s',
	'X-Frame-Options',
	'SAMEORIGIN',
	'Strict-Transport-Security',
	'max-age=15552000; includeSubDomains',
	'X-Content-Type-Options',
	'nosniff',
	'X-XSS-Protection',
	'1; mode=block',
	'Expect-CT',
	'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
	'Server',
	'cloudflare',
	'CF-RAY',
	'44321035489a1fac-DFW' ]);
}

function nockUserSlugSuccess () {
	nock('https://www.stream.me:443', {'encodedQueryParams': true})
  .get('/api-user/v1/users/4882ff3e-47cd-48c9-8bb7-858eca571710/channel')
  .reply(200, {'_embedded': {'streams': [{'_links': {'thumbnail': {'href': 'https://static1.creekcdn.com/frozen/images/streamme/streamme-fishee.jpg'}, 'thumbnailSquare': {'href': 'https://static1.creekcdn.com/frozen/images/streamme/streamme-fishee-sq.jpg'}, 'banner': {'href': 'https://user-image.creekcdn.com/mediasvc/v1/user/banner/v/1/res/1440x360/4882ff3e-47cd-48c9-8bb7-858eca571710.jpg', 'template': 'https://user-image.creekcdn.com/mediasvc/v1/user/banner/v/1/res/{width}x{height}/4882ff3e-47cd-48c9-8bb7-858eca571710.jpg'}, 'avatar': {'href': 'https://user-image.creekcdn.com/mediasvc/v1/user/avatar/v/1/res/256x256/4882ff3e-47cd-48c9-8bb7-858eca571710.jpg', 'template': 'https://user-image.creekcdn.com/mediasvc/v1/user/avatar/v/1/res/{width}x{height}/4882ff3e-47cd-48c9-8bb7-858eca571710.jpg'}}, 'manifest': 'https://edge.stream.me/live/b522e7c9-7e2a-4037-8db4-29f94cbb1c4c.json?overrideCdnDomain=sea1a-edge.stream.me', 'active': false, 'title': 'You can call me the mighty farmer', 'privateLocked': false, 'username': 'yourknightmares', 'userSlug': 'yourknightmares', 'displayName': 'yourknightmares', 'clientName': 'Web', 'clientSlug': 'web', 'ageRating': 13, 'lastStarted': 1522527792000, 'publicId': 'b522e7c9-7e2a-4037-8db4-29f94cbb1c4c', 'rebroadcast': false, 'promotedUntil': '2018-07-31 18:17:42', 'stats': {'human': {'likes': '0', 'dislikes': '0', 'followers': '94', 'following': '63', 'viewers': '0', 'totalViews': '3,600', 'subscribers': '1', 'supporters': '0'}, 'raw': {'likes': 0, 'dislikes': 0, 'followers': 94, 'following': 63, 'viewers': 0, 'totalViews': 3600, 'subscribers': 1, 'supporters': 0}}, 'userPublicId': '4882ff3e-47cd-48c9-8bb7-858eca571710', 'chatroomId': 'user:4882ff3e-47cd-48c9-8bb7-858eca571710:web', 'tags': [], 'topics': [{'id': '6d35a988-49e7-4dcd-86ab-0d19472ad53c', 'name': 'Stardew Valley', 'slug': 'stardew-valley', '_links': {'icon': {'href': 'https://static1.creekcdn.com/frozen/images/topics/icon/default.png'}, 'cover': {'href': 'https://static1.creekcdn.com/frozen/images/topics/cover/default.jpg'}, 'banner': {'href': 'https://static1.creekcdn.com/frozen/images/topics/banner/default.jpg'}, 'topicPage': {'href': 'https://www.stream.me/topics/stardew-valley'}}}], 'mentions': [], 'interactions': {'following': false, 'affection': 0, 'subscribed': false}, 'multistreams': [{'created': '2018-03-31T20:19:00.000Z', 'title': 'Rainbow Six Siege! Multi Party!', 'publicId': 'V8nKAb3w', 'slug': 'Rainbow-Six-Siege-Mu', 'chatroomId': 'multistream:V8nKAb3w', 'liveStreamCount': 0}, {'created': '2017-11-08T22:39:45.000Z', 'title': 'Fortnite on StreamMe! ', 'publicId': '9Zp7kqx6', 'slug': 'Fortnite-on-StreamMe', 'chatroomId': 'multistream:9Zp7kqx6', 'liveStreamCount': 0}], 'tournaments': [], 'privateLockTypes': [], 'ads': {'prerollUrl': 'https://www.stream.me/api-ads/v4/media/live/b522e7c9-7e2a-4037-8db4-29f94cbb1c4c/feature?width=[WIDTH]&height=[HEIGHT]', 'retries': 1}}]}, '_links': {'banner': {'href': 'https://user-image.creekcdn.com/mediasvc/v1/user/banner/v/1/res/1440x360/4882ff3e-47cd-48c9-8bb7-858eca571710.jpg', 'template': 'https://user-image.creekcdn.com/mediasvc/v1/user/banner/v/1/res/{width}x{height}/4882ff3e-47cd-48c9-8bb7-858eca571710.jpg'}, 'avatar': {'href': 'https://user-image.creekcdn.com/mediasvc/v1/user/avatar/v/1/res/256x256/4882ff3e-47cd-48c9-8bb7-858eca571710.jpg', 'template': 'https://user-image.creekcdn.com/mediasvc/v1/user/avatar/v/1/res/{width}x{height}/4882ff3e-47cd-48c9-8bb7-858eca571710.jpg'}, 'subscribe': 'https://www.stream.me/products/subscriptions/yourknightmares/products/0wo8', 'subscribeCreditCard': 'https://www.stream.me/api-subscribe/v2/subscribe/users/4882ff3e-47cd-48c9-8bb7-858eca571710?paymentGateway=rocketgate', 'subscribeOther': 'https://www.stream.me/products/subscriptions/yourknightmares/products/0wo8?paymentGateway=xsolla', 'subscribeCoins': 'https://www.stream.me/products/subscriptions/yourknightmares/products/0wo8?paymentGateway=smcoins'}, 'username': 'yourknightmares', 'slug': 'yourknightmares', 'description': '', 'networks': [{'name': 'twitter', 'href': 'http://www.twitter.com/yourknightmares'}, {'name': 'youtube', 'href': 'http://youtube.com/yourknightmares'}], 'displayName': 'yourknightmares', 'location': 'San Antonio, Texas', 'userPublicId': '4882ff3e-47cd-48c9-8bb7-858eca571710', 'stats': {'human': {'totalViews': '3,600', 'followers': '94', 'following': '63', 'subscribers': '1', 'supporters': '0', 'viewers': '0'}, 'raw': {'totalViews': 3600, 'followers': 94, 'following': 63, 'subscribers': 1, 'supporters': 0, 'viewers': 0}}, 'interactions': {'following': false, 'affection': 0, 'subscribed': false}, 'chatroomId': 'multistream:V8nKAb3w', 'lastStarted': 1522527792000, 'donateProfile': {'enabled': true, 'showGiven': true, 'showReceived': true}, 'subscribe': {'amount': '$1.50', 'currency': 'USD'}, 'subscribeCoins': {'amount': 240, 'currency': 'SMC'}, 'giftProfile': {'userPublicId': '4882ff3e-47cd-48c9-8bb7-858eca571710', 'showGiven': true, 'showReceived': true, 'enabled': true}, 'stickerPreferences': {'allowStickers': true}}, [ 'Date',
	'Tue, 31 Jul 2018 18:17:42 GMT',
	'Content-Type',
	'application/json; charset=utf-8',
	'Transfer-Encoding',
	'chunked',
	'Connection',
	'close',
	'Set-Cookie',
	'__cfduid=d14c35f26c0eb78a61115e7b8844423891533061062; expires=Wed, 31-Jul-19 18:17:42 GMT; path=/; domain=.stream.me; HttpOnly',
	'Vary',
	'Accept-Encoding',
	'ETag',
	'W/"120J2jGProvLcrCSlhmuJA=="',
	'X-Proxy-Read-Timeout',
	'20s',
	'X-Frame-Options',
	'SAMEORIGIN',
	'Strict-Transport-Security',
	'max-age=15552000; includeSubDomains',
	'X-Content-Type-Options',
	'nosniff',
	'X-XSS-Protection',
	'1; mode=block',
	'Expect-CT',
	'max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"',
	'Server',
	'cloudflare',
	'CF-RAY',
	'443210362b5358c1-DFW' ]);
}
