const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { VoiceChannel } = require('discord.js');
const { useMainPlayer } = require('discord-player');
// const ytdl = require('ytdl-core'); さよなら!!!
// const yts = require('yt-search'); 検索機能？要らんやろ
//


console.log("Loaded play.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('音楽を再生します!')
		.addStringOption(option =>
			option
				.setName("query")
				.setDescription("YouTubeやSoundCloudのリンク、または検索したいワード")
				.setRequired(true)
		),
    execute: async function (interaction) {
		const player = useMainPlayer();
		const query = interaction.options.get("query").value;
		const member = interaction.member;
		const channel = member.voice.channel;

        if (!channel) {
			await interaction.reply("えー流したくないなぁー...だってVCに実行者が居ないんだもん...")
			return;
		}

		await interaction.deferReply();

		try {
			const { track } = await player.play(channel, query, {
				nodeOptions: {
					// nodeOptions are the options for guild node (aka your queue in simple word)
					metadata: interaction // we can access this metadata object using queue.metadata later on
				}
			});
	
			return interaction.followUp({
				embeds: [{
					title: `**${track.title}**をキューに追加しました!`,
					thumbnail: {
						url: track.thumbnail
					},
					color: 0x5865f2,
				}]
			})
		} catch (e) {
			// let's return error if something failed
			return interaction.followUp(`ばーか! ${e}`);
		}


    }
};