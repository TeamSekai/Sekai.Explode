const { SlashCommandBuilder } = require('discord.js');
const mongodb = require('../internal/mongodb') //*MongoDB

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gban')
        .setDescription('作成中')
		.addSubcommand(subcommand => 
			subcommand
				.setName('sync')
				.setDescription('データベースとの同期を行います。(BANされていないユーザーが居た場合には自動BANを行います。')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('グローバルBANリストにユーザーを追加します.')
				.addUserOption(option => (
					option
						.setName("user")
						.setDescription("ユーザーを指定します。")
						.setRequired(true)
				))
		),
    execute: async function (interaction) {
        await interaction.reply(`作成中...`) //!完成したら削除すること
		const subcommand = interaction.options.getSubcommand()
		if (subcommand === 'sync') {
			//TODO: do yourself
		}
		
    }
};