// Discord.js Bot - by ringoXD
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '1';
const { Client, Events, GatewayIntentBits, Status, ActivityType } = require('discord.js');
const fs = require("fs");
const path = require("path");
const { token, guildId } = require('./config.json');

let commands = [];
fs.readdirSync(path.join(__dirname, "commands"), {
	withFileTypes: true
}).forEach((file) => {
	if (!file.isFile() || path.extname(file.name) != ".js")
		return;
	commands.push(require(path.join(__dirname, "commands", file.name)));
})

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
	console.log(`Logged in as ${c.user.tag}`);
	client.user.setActivity('起動中...', {status: 'dnd'});
});

client.on('ready', async () => {
	console.log("Registering guild commands...")
	await client.application.commands.set(commands.map(x => x.data.toJSON()), guildId);
	console.log("Ready!");
	setInterval(() => {
		client.user.setActivity({
			name: `[${client.ws.ping}ms] | /ping`,
			type: ActivityType.Competing,
			Status: `online`
		})
	}, 10000)
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	let command = commands.find(x => x.data.name == interaction.commandName);
	if (!command) {
		console.error(`${interaction.commandName}というコマンドには対応していません。`);
		return;
	}
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
		} else {
			await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
		}
	}
});

client.login(token);