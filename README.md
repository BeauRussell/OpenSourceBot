# StreamMe Command Bot



This bot is posted publically as an example command bot to help a user write their own bot for 
use on the website. In this documentation you will find all the resources you need to create your
own bot, any other questions that you have may be asked in the [discord][1] or emailed to 
support@stream.me.

## Receiving Messages

The websocket that the bot needs to listen to to receive messages is
`wss://www.stream.me/api-rooms/v3/ws` which requires you to send this join message on open:

```
chat {"action":"join","room":"{roomId}"}
```

Where `roomId = user:{channelPublicId}:web` (As it will be used through the documentation)

From there the web socket will receive data as strings that needs to be parsed. The data follows 
the following format:

```
NameSpace DataType InfoToBeParsed
```

The `NameSpace` is the type of information received (join, chat, etc.) so you should listen 
specifically for chat messages. The `DataType` will tell you if the chat is a message or if it's 
an error. Once you slice those two pieces of information off, you will need the manifest for the 
chat room to parse the data. This by making the following request:

```
GET https://www.stream.me/api-web/v1/chat/room/${roomId}

RESPONSE
4XX

if information is accurate:
200
[Object]
```

Within the returned object, the `.parserManifests` key needs to be sent with the data from the 
web socket to `parse-message.js`. An object will be returned with actual information to be used 
in your commands:

```
{
	actor: {
		appSlug: 'web',
		avatar: 'https://user-image.creekcdn.com/mediasvc/v1/user/avatar/v/1/res/256x256/4882ff3e-47cd-48c9-8bb7-858eca571710.jpg',
		badges: [],
		color: '#FF6600',
		role: 'user',
		slug: 'yourknightmares',
		userPublicID: '4882ff3e-47cd-48c9-8bb7-858eca571710',
		username: 'yourknightmares'
	},
	emoticons: [],
	id: '1525110380685306471',
	links: [],
	mentions: [],
	message: 'Hello World!',
	originalRoom: null,
	tags: [],
	theme: null,
	timestamp: 1525110380,
	version: 'v2',
	_index: {}
}
```

## Send a Message as a bot

You can send a message as a user using the following request:

```
POST https://www.stream.me/api-commands/v1/room/{roomPublicID}/command/say
-d '{"message":"test message"}'

RESPONSE
400 - request body: {} or {"message":""}

if message sent is a regular chat message:
200
{
	"message":"parsed test message"
}

if message sent is a chat action that requires data sent back:
200
{
	"data":"message to be displayed"
}
```

However, this request needs an authorization header, like:

```
headers: {
	Authorization: `Bearer ${token}`
}
```

The token for the bot can be retrieved through the following request:

```
	POST https://www.stream.me/api-auth/v1/login-bot
	-d {key: botKey, secret: botSecret}

	RESPONSE
	200
	{ 
		token_type: 'bearer',
  	access_token: 'ACCESS TOKEN',
  	expires_in: 129600
  }
```

Once the access token is saved, it can be used with the `say` endpoint from API commands as 
stated earlier.

## Other StreamMe APIs Used In Commands

#### Follow Creation Date

```
POST https://www.stream.me/api-user/v2/${userSlug}/follow/${channelSlug}

RESPONSE
404 - The user is not following the channel

200
{
	"notify":1,
	"created": "2017-07-29T17:40:28.000Z"
}
```

The created date is given in `ISO 8601` format, which can be used with the `Date` library to be 
parsed and formatted how you would like to use it.

#### Stream Start Time

```
GET https://www.stream.me/api-channel/v1/channels?publicIds=${publicId}
```

This will return a very large array of information. You will need to enter the first index which 
will give you an object, inside of which has another array labeled `.streams` that you again need
to access the first index of. Finally this will have 2 values that you need, `.active` and 
`.lastStarted`. `.active` gives you a truthy value assigned to if the channel is actually online,
allowing you to check that before doing any calculations. The `.lastStarted` value returns the 
date in the format of milliseconds past 1 January 1970, which can easily be used with the JS 
`Date` object.

If you feel more comfortable using slugs, you can make the same request with a userSlug:

```
GET https://www.stream.me/api-channel/v1/channels?usernames=${userSlug}
```


## Documentation for Other APIs and Objects used

[JavaScript Date Object][2]

[Pastebin Api][3]



[1]: https://discord.gg/YchZTYY
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[3]: https://pastebin.com/api