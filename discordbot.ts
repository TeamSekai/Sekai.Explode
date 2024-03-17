import { wrapWrite } from './internal/logger';
import { ClientMessageHandler } from './internal/messages';

//* Discord.js Bot - by ringoXD -
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
require('colors');
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { token, syslogChannel } from './config.json';
process.env['FFMPEG_PATH'] = path.join(__dirname, 'ffmpeg');

//!Load Internal dir code
import { onShutdown } from './internal/schedules';
import activity from './internal/activity';
import mongodb from './internal/mongodb';

mongodb.connectMongoose();

import { LANG, strFormat } from './util/languages';
import { CommandManager } from './internal/commands';
import assert from 'assert';

const creset = '\x1b[0m';
const cgreen = '\x1b[32m';

//!LOGGER
wrapWrite(process.stdout, 'discordbot.log');
wrapWrite(process.stderr, 'discordbot.log');

//!RUN=======================

console.log(LANG.discordbot.main.botStarting);

const options = {
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
	],
	// ws: { properties: { $browser: "Discord iOS" }}
};

console.log(
	cgreen +
		strFormat(LANG.discordbot.main.commandsLoaded, [
			CommandManager.default.size,
		]) +
		creset,
);
const client = new Client(options);
console.log(LANG.discordbot.main.setupActivityCalling);
activity.setupActivity(client);
let messageHandler: ClientMessageHandler | undefined;

const features = fs
	.readdirSync(path.join(__dirname, 'packages'))
	.map((file) => {
		console.log(`loading ${file} feature`);
		const feature = require(file).feature;
		if (feature == null) {
			throw new TypeError(`${file} feature is undefined`);
		}
		return feature;
	});
const featuresLoadPromise = Promise.all(
	features.map((feature) => feature.onLoad?.(client)),
);

client.on('ready', async (readyClient) => {
	await featuresLoadPromise;
	await Promise.all(
		features.map((feature) => feature.onClientReady?.(readyClient)),
	);
	console.log(
		strFormat(LANG.discordbot.ready.loggedIn, {
			cgreen,
			creset,
			tag: client.user.tag,
		}),
	);
	client.user.setPresence({
		activities: [
			{
				name: LANG.discordbot.ready.presenceNameLoading,
				state: LANG.discordbot.ready.presenceStateLoading,
				type: ActivityType.Playing,
			},
		],
		status: 'dnd',
	});
	console.log(LANG.discordbot.ready.commandsRegistering);
	await CommandManager.default.setClient(readyClient);
	console.log(cgreen + LANG.discordbot.ready.commandsReady + creset);
	const SyslogChannel = client.channels.cache.get(syslogChannel);
	assert(SyslogChannel.isTextBased());
	SyslogChannel.send(LANG.discordbot.ready.sysLog);
	messageHandler = new ClientMessageHandler(readyClient);
});

onShutdown(async () => {
	const SyslogChannel = client.channels.cache.get(syslogChannel);
	assert(SyslogChannel.isTextBased());
	await SyslogChannel.send(LANG.discordbot.shutdown.sysLog);
	await Promise.all(features.map((feature) => feature.onUnload?.()));
	await Promise.all([
		client
			.destroy()
			.then(() =>
				console.log(cgreen + LANG.discordbot.shutdown.loggedOut + creset),
			),
		mongodb.connection.close(),
	]);
});

client.login(token);

client.on('messageCreate', (message) => messageHandler?.handleMessage(message));

//!EVENTS

process.on('uncaughtException', function (err) {
	console.error(err);
});
