const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Lookup Server/User Info')
		.addSubcommand(subcommand =>
            subcommand
                .setName('user')
				.setDescription('ユーザーの情報を調べます!')
				.addUserOption(option => (
					option
						.setName("target")
						.setDescription("ユーザーを指定します。")
						.setRequired(true)
				))
		)
		.addSubcommand(subcommand =>
            subcommand
                .setName('server')
				.setDescription('サーバーの情報を調べます!')
		),
		execute: async function (interaction) {
			await interaction.reply("Soon...")
		}
};