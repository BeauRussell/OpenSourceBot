# StreamMe Command Bot

This bot is posted publically as an example command bot to help a user write their own bot for 
use on the website. In this documentation you will find all the resources you need to create your
own bot, any other questions that you have may be asked in the [discord][1] or emailed to 
support@stream.me.

**Table of Contents**

- [Installation](#installation)
	* [Required Software](#install-required-software)
	* [Install Bot](#install-bot-and-packages)
- [Setup Your bot](#setting-up-your-bot)
	* [Registration](#register-your-bot)
	* [Authorize Someone Else's Bot](#authorize-a-bot)
	* [Running This Bot](#running-this-bot)
- [Writing Your Own Bot](#creating-your-own-bot)
	* [Receiving Messages](#receving-messages)
	* [Sending a Message](#send-a-message-as-a-bot)
	* [Other StreamMe APIs Used](#other-streamme-apis-used-in-commands)
	* [Third-Party Packages and Objects](#documentation-for-packages-and-objects-used)

## Installation

### Install required Software

If you have not worked with JavaScript before, you will need to start by installing node by 
visiting [https://nodejs.org/][6]. The LTS version is recommended for most users, only 
download the current version if you know what you're doing.

Once you have installed node, make sure it is globally installed by opening your command prompt 
and typing the command `node -v`, then `npm -v`. You should see output similar to below:

```
$ node -v
v8.11.3
$ npm -v
6.1.0
```

### Install Bot and Packages

Now that you have installed all the necessary software to download and run the bot, visit the 
[Bot Page][7]. On the right side of the task bar located above the file listing, there is a green 
button labeled "Clone or download". Clicking that will open a dropdown with `Download ZIP` on the 
bottom. This will download a zip file containing the bot.

Head over to where the file downloaded, right click on it and extract it to your desktop. Once 
that is completed, open your computer's command prompt. From here type 
`cd desktop/OpenSourceBot-master`. This will change the window to point into the directory the 
bot is residing in.

Once you are inside the directory, run `npm i`. This will install all the packages required 
to run the bot, and is the last step in the installation. Once that is finished, also run 
`npm link` in the terminal, this will set up the command you enter to run the bot.

## Setting Up Your Bot

Start by making sure you are logged into your account on the [website][4], then heading over to
the [bot developers page][5].

From here you can find 2 sections, [Creating a Chat Bot](#register-your-bot) and
[Authorize Third Party Bots](#authorize-a-bot).

### Register Your Bot

To register your own bot, simple type a name for it into the `Create new bot` field and press 
the `create` button. This will open a new section on the page labeled `Your Bots`, here you can 
find a list of all the bots you created, with their specified key and secret. You will need both 
this key and secret for use in your bot, as well as your public Id, shown at the top of this 
section.

### Authorize a bot

If someone else is running a bot in your channel for you, they will need your publicId toa access 
your room. This can be found under the following endpoint:
```
https://www.stream.me/api-user/v1/{username}/channel
```

The value is labeled by `userPublicId`. You can also create your own bot and the information will 
display to you in the `Your Bots` section of the page, as listed above.

Once they have your public Id, you can either search for the name of their bot to authorize it on 
the developers page, or in your [chat settings](https://www.stream.me/settings/chat#authbots).

## Running This Bot

This is the easy part. Once you have followed all the steps above, make sure your command prompt 
is pointed into the directory the bot is in, if you're not sure, you can close the command prompt, 
reopen it, and type in the same `cd desktop/OpenSourceBot-master` command. From there write in the 
following command (You can paste the values from the website by copying them, then using the 
SHIFT + INS shortcut).

```
streammebot -k <bot key> -s <bot secret> -i <your id>
```

After a second or two you will see a message from the bot reading "Connected and Listening for new 
messages". This indicates that the bot should be working properly, and is ready for use.

## Creating Your own Bot

### Receiving Messages

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

### Send a Message as a bot

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

### Other StreamMe APIs Used In Commands

##### Follow Creation Date

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

##### Stream Start Time

```
GET https://www.stream.me/api-channel/v1/channels?publicIds=${publicId}
```

This will return a very large array of information. You will need to enter the first index which 
will give you an object, inside of which has another array labeled `.streams` that you again need
to access the first index of. Finally this will have 2 values that you need, `.active` and 
`.lastStarted`. `.active` gives you a truthy value assigned to if the channel is actually online,
allowing you to check that before doing any calculations. The `.lastStarted` value returns the 
date in the format of milliseconds past 1 January 1970, which can easily be used with the `moment` 
package, or the JS `Date` object.

If you feel more comfortable using slugs, you can make the same request with a userSlug:

```
GET https://www.stream.me/api-channel/v1/channels?usernames=${userSlug}
```


### Documentation for Packages and Objects Used

[Moment.js][2]

[Moment Duration Format][9]

[pino][3]

[commander][8]



[1]: https://discord.gg/YchZTYY
[2]: http://momentjs.com/docs/
[3]: https://www.npmjs.com/package/pino
[4]: https://www.stream.me
[5]: https://developers.stream.me/bots
[6]: https://nodejs.org/
[7]: https://github.com/BeauRussell/OpenSourceBot.git
[8]: https://www.npmjs.com/package/commander
[9]: https://github.com/jsmreese/moment-duration-format