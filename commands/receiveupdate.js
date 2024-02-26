const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { LANG } = require('../util/languages');

// いいかんじに
module.exports = {
    data: new SlashCommandBuilder()
        .setName('follow_announcements')
        .setDescription('Sekai.Explode開発者からのアナウンスを受信します!')
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('受信するチャンネルを指定します。')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true)
		),
    execute: async function (interaction) {
		const targetchannel = interaction.options.getChannel('channel');
		try {
			await targetchannel.addFollower('1211685593025609749', `${interaction.user.displayName} created announcements!`)
			console.log(`[Sekai.Explode] new follower! ${interaction.guild.name} - ${interaction.guild.id}`)
		} catch (e) { console.log(e) }
		return await interaction.reply(`<#${targetchannel.id}>にSekai.Explodeのアナウンスを通知します :wave:`)
    }
};