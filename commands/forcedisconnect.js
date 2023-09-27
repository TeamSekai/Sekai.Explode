const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createReadStream } = require('fs');
const { join } = require('path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disconnect')
		.setDescription('せつだん'),
	execute: async function(interaction) {
		const member = interaction.member;
		const voiceChannel = member.voice.channel;

	if (!voiceChannel) {
		await interaction.reply("ぽまえvc居らんから無理やで");
		return;
	}


    const connection = joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: voiceChannel.guild.id,
		adapterCreator: voiceChannel.guild.voiceAdapterCreator,
	});
	
	// 音声再生が終了したらボイスチャットから退出
	connection.destroy();
	await interaction.reply("ばいばい");
	}
};