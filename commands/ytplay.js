const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice')
const player = require('discord-player');
const { VoiceChannel } = require('discord.js');
const yt = require('youtube-ext')
// const ytdl = require('ytdl-core'); さよなら!!!
// const yts = require('yt-search'); 検索機能？要らんやろ

console.log("Loaded play.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play_yt')
        .setDescription('YouTubeの動画/音楽を再生します。Googleが怒ります。')
		.addStringOption(option =>
			option
				.setName("query")
				.setDescription("YouTubeのリンク、または検索したいワード")
				.setRequired(true)
		),
    execute: async function (interaction) {
		const query = interaction.options.get("query", true);
		const member = interaction.member;
		const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
			await interaction.editreply("えー流したくないなぁー...だってVCに実行者が居ないんだもん...")
		}

		await interaction.deferReply();
		try {
			const { track } = await player.play(voiceChannel, query, {
				nodeOptions: {
					// nodeOptions are the options for guild node (aka your queue in simple word)
					metadata: interaction // we can access this metadata object using queue.metadata later on
				}
			});
	
			return interaction.editReply(`**${track.title}** をキューに追加しました！`);
		} catch (e) {
			// let's return error if something failed
			return interaction.editReply(`吐血しちゃった... ${e}`);
		}


    }
};