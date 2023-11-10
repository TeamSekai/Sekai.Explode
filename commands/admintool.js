const { SlashCommandBuilder, IntegrationApplication } = require('discord.js');
const { Rcon } = require('rcon-client');
const { AdminRoleID, rconhost1, rconport1, rconpass1 } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admintool')
        .setDescription('MCSV-JE&BEの運営用コマンド')
		.addSubcommand(subcommand =>
            subcommand
                .setName('mc_restart')
				.setDescription('サーバーを再起動します。')
				.addStringOption(option => (
					option
					.setName('target')
                	.setDescription('再起動するサーバーを選択')
                	.setRequired(true)
                	.addChoices({name:"メインサーバー",value:"main"})
                	.addChoices({name:"(未完成)クリエイティブサーバー",value:"creative"})
                	.addChoices({name:"(未完成)PvPサーバー",value:"pvp"})
				))
		),
    execute: async function (interaction) {
        const member = interaction.guild.members.cache.get(interaction.user.id);
		if (!member.roles.cache.has(AdminRoleID)) {
			await interaction.reply({ content: '管理者権限がありません。', ephemeral: true });
		}
		if (interaction.options.getSubcommand() === 'mc_restart') {
			if (interaction.options.getString('target') ==='main') {
                await interaction.reply('<a:loading:1071641234310955129> 接続中...')
				console.log(`Connecting to ${rconhost1}:${rconport1}...`)
				const rcon = new Rcon({
					host: rconhost1,
                    port: rconport1,
                    password: rconpass1
				});
				rcon.connect();
				rcon.send('/say はろーわーるど');
				rcon.send('/discord bcast はろーわーるど!');
				rcon.end();
				interaction.editReply(`<:check:962405846002847754> サーバーにリクエストを送信しました!`)
            } else if (interaction.options.getString('target') === 'creative') {
                await interaction.reply('準備中')
            } else if (interaction.options.getString('target') === 'pvp') {
                await interaction.reply('準備中')
            }
		}

	}
}