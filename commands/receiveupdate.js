const { SlashCommandBuilder, ChannelType, PermissionsBitField, CommandInteraction } = require('discord.js');
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
    execute: async function (/** @type {CommandInteraction} */ interaction, client) {
		await interaction.deferReply()
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return await interaction.editReply('権限がありません!(管理者権限が必要です。)')
		}
		const targetchannel = interaction.options.getChannel('channel');
		client.channels.resolve("1211695901760819281").addFollower(targetchannel.id) //TODO: config.jsonで編集可能に?
			.then(() =>
				console.log(`[Sekai.Explode] new follower! ${interaction.guild.name} - ${interaction.guild.id}`),
				interaction.editReply(`<#${targetchannel.id}>にSekai.Explodeのアナウンスを通知します :wave:`)
			)
			.catch((e) =>
				console.log(`Something Went wrong. ${e}`),
				interaction.editReply(`失敗しました！エラー: ${e}`)
			)
    }
};