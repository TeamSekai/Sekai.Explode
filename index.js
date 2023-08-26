// Discord.js Bot - by ringoXD

const { Client, Events, GatewayIntentBits } = require('discord.js');

const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
	console.log(`準備OKです! ${c.user.tag}がログインします。`);
});


client.on(Events.InteractionCreate, async interaction => {


	if (!interaction.isChatInputCommand()) return;

	// heyコマンドに対する処理
	if (interaction.commandName === testFile.data.name) {
		try {
			await testFile.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
			} else {
				await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
			}
		}
	} else {
		console.error(`${interaction.commandName}というコマンドには対応していません。`);
	}
});


client.login(token);