const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, QueryType } = require('discord-player');
const { getPlayableVoiceChannelId, getDuration } = require('../util/players');
const Timespan = require('../util/timespan');
// const ytdl = require('ytdl-core'); さよなら!!!
// const yts = require('yt-search'); 検索機能？要らんやろ
//

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
		const voiceChannelId = getPlayableVoiceChannelId(interaction);
		if (voiceChannelId == null)
            return await interaction.reply({ content: 'えー実行したくないなぁー...だってVCに君が居ないんだもん...', ephemeral: true });

		const player = useMainPlayer();
		const query = interaction.options.get("query").value;

		await interaction.deferReply();

		try {
			const searchResult = await player.search(query, { requestedBy: interaction.user, searchEngine: QueryType.AUTO });

    		if (!searchResult || searchResult.tracks.length == 0 || !searchResult.tracks) {
    		  return interaction.followUp('うわーん！曲が見つからなかったよぉ...');
    		}
    		const res = await player.play(voiceChannelId, searchResult, {
    		  nodeOptions: {
    		    metadata: {
    		      channel: interaction.channel,
    		      client: interaction.guild.members.me,
    		      requestedBy: interaction.user,
    		    },
				// volume: 5,
    		    bufferingTimeout: 15000,
    		    leaveOnStop: true,
    		    leaveOnStopCooldown: 5000,
    		    leaveOnEnd: true,
    		    leaveOnEndCooldown: 15000,
    		    leaveOnEmpty: true,
    		    leaveOnEmptyCooldown: 300000,
    		    skipOnNoStream: true,
    		  },
    		});

			const duration = getDuration(res.track);
			const message = res.track.playlist
				? `**${res.track.playlist.title} (${duration})**をキューに追加しました！`
				: `**${res.track.author} - ${res.track.title} (${duration})**をキューに追加しました！`;

			return interaction.followUp({
				embeds: [{
					title: message,
					color: 0x5865f2,
					footer: {
                        text: `リクエスト者: ${interaction.user.tag}`
                    },
				}]
			})
		} catch (e) {
			// let's return error if something failed
			console.error(e);
			return interaction.followUp(`ばーか! ${e}`);
		}


    }
};