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
	* [Third-Party APIs and Objects](#documentation-for-other-apis-and-objects-used)



## Installation

### Install required Software

If you have not worked with JavaScript before, you will need to start by installing [node][6]. 
The LTS version is recommended for most users, only download the current version if you know what 
you're doing.

Once you have installed node, make sure it is globally installed by opening your command prompt 
and typing the command `node -v`, then `npm -v`. You should see output similar to below:

```
$ node -v
v8.11.3
$ npm -v
6.1.0
```

If you get a reasonable version number for both of those commands, install [git][7].

To make sure git is properly installed, go back to your command prompt and run `git --verison`. 
This should give you output similar to below: 

```
$ git --version
git version 2.18.0
```

### Install Bot and Packages

Now that you have installed all the necessary software to install and run the bot, you can 
proceed in your command prompt. Once you have opened it, you will be in your home directory. 
Decide where you would like to save the bot and navigate there with the `cd` command. If you
do not know the command line, I suggest you install the bot on either your desktop or in your
documents folder by running either `cd desktop` or `cd documents`. Once you have navigated to 
where you want to install the bot, you need to clone the code with the command below:

```
git clone https://github.com/BeauRussell/OpenSourceBot.git
```

After that command runs, it should create a directory named "OpenSourceBot" with several files 
in it, you can change the name of the directory if you prefer. Continue by running the `cd` command
again in your terminal to change directories into the newly installed directory. If you do not 
change the name of the directory, this can be done by simply running `cd OpenSourceBot`.

Once you are inside the directory, just run `npm i`. This will install all the packages required 
to run the bot, and is the last step in the installation.

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

If you downloaded our open source bot, you just need to copy these 3 values over into the bot. 
Open up your file browser and navigate into the directory created earlier when you cloned down the 
code. In this directory, you will see a file named `index.js` right click on this file and click on
`open with`. This will open a popup where you can select what program you want to open the file in.
If you have a preferred text editor, you can open it in that, if not, just open it with notepad.

You can ignore most of the code in the file, but right at the top (lines 5, 6, and 8 of the code) 
there are 3 fields where you need to copy over the information from your bot creation. The botKey 
and botSecret fields are labeled in your browser to copy over, and your public Id is found right 
under the `Your Bots` section. If the bot is being used in a channel that is not belonging to the 
account you are logged in as, you will need to attain their public Id.

**IMPORTANT**
Make sure when you copy the key, secret, and id over into the file, you leave the single quotes 
around the values, or this will break the code.

### Authorize a bot

If someone else is running a bot in your channel for you, they will need your publicId toa access 
your room. This can be found under the following endpoint:
```
https://www.stream.me/api-user/v1/{username}/channel
```

The value is labeled by `userPublicId`. You can also create your own bot and the information will 
display to you in the `Your Bots` section of the page.

Once they have your public Id, you can either search for the name of their bot to authorize it on 
the developers page, or in your [chat settings](https://www.stream.me/settings/chat#authbots).

## Running This Bot

This is the easy part. Once you have followed all the steps above, make sure your command prompt 
is pointed into the directory the bot is in, and run `node index`. This will run your bot, and show
no output while it's running, unless something errors.

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
date in the format of milliseconds past 1 January 1970, which can easily be used with the JS 
`Date` object.

If you feel more comfortable using slugs, you can make the same request with a userSlug:

```
GET https://www.stream.me/api-channel/v1/channels?usernames=${userSlug}
```


### Documentation for Other APIs and Objects used

[JavaScript Date Object][2]

[Pastebin Api][3]



[1]: https://discord.gg/YchZTYY
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[3]: https://pastebin.com/api
[4]: https://www.stream.me
[5]: https://developers.stream.me/bots
[6]: https://nodejs.org/
[7]: https://gitforwindows.org/