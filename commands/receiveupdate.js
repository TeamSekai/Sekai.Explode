const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const config = require('../config.json')
const { LANG } = require('../util/languages');

module.exports = {
    data: new SlashCommandBuilder()
		//TODO: i18n
        .setName('follow_announcements')
        .setDescription('Sekai.Explodeの最新情報をフォローします!')
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('受信するチャンネルを指定します。')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true)
		),
    execute: async function (interaction, client) {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return await interaction.reply('権限がありません!(管理者権限が必要です。)')
		}
		const targetchannel = interaction.options.getChannel('channel');
		client.channels.resolve("1211695901760819281").addFollower(targetchannel.id) //TODO: config.jsonで編集可能に?
			.then(() =>
				console.log(`[Sekai.Explode] new follower! ${interaction.guild.name} - ${interaction.guild.id}`),
				interaction.reply(`<#${targetchannel.id}>にSekai.Explodeのアナウンスを通知します :wave:`)
			)
			.catch(
				console.log(e),
				interaction.reply(`失敗しました！エラー: ${e}`)
			)
    }
};