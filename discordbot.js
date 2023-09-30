// Discord.js Bot - by ringoXD
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '1';
const { Client, Events, Intents, Status, ActivityType } = require('discord.js');
const fs = require("fs");
const path = require("path");
const { token, guildId } = require('./config.json');
const { generateDependencyReport } = require('@discordjs/voice');
const activity = require('./activity');
let commands = [];

console.log('Starting Discord.js bot...')

fs.readdirSync(path.join(__dirname, "commands"), {
	withFileTypes: true
}).forEach((file) => {
	if (!file.isFile() || path.extname(file.name) != ".js")
		return;
	commands.push(require(path.join(__dirname, "commands", file.name)));
})

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES]
})


activity.setupActivity(client);

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}`);
	client.user.setActivity('起動中...', {status: 'dnd'});
	console.log("Registering guild commands...")
	await client.application.commands.set(commands.map(x => x.data.toJSON()));
	console.log("Ready!");
	let SyslogChannel = client.channels.cache.get("1151139585791901746");
	SyslogChannel.send('Discord.js Bot is Ready!')
	const wsping = client.ws.ping;
	activity.addPingValue(wsping)
	client.user.setActivity({
		name: `[${client.ws.ping}ms] | Created by ringoXD`,
		type: `LISTENING`,
		Status: `online`
	})
})


client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	let command = commands.find(x => x.data.name == interaction.commandName);
	if (!command) {
		console.error(`${interaction.commandName}というコマンドには対応していません。`);
		return;
	}
	try {
		await command.execute(interaction);
	} catch (error) {
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
		} else {
			await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
		}
		throw error;
	}
});

client.login(token);

process.on('uncaughtException', function(err) {
    console.error(err);
    console.error("Depend Err ->" + generateDependencyReport());
});
