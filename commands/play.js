const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, QueryType } = require('discord-player');
const { getPlayableVoiceChannelId, getDuration } = require('../util/players');
const Timespan = require('../util/timespan');
const { LANG, strFormat } = require('../util/languages');
// const ytdl = require('ytdl-core'); さよなら!!!
// const yts = require('yt-search'); 検索機能？要らんやろ
//

module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.play.name)
        .setDescription(LANG.commands.play.description)
		.addStringOption(option =>
			option
				.setName(LANG.commands.play.options.query.name)
				.setDescription(LANG.commands.play.options.query.description)
				.setRequired(true)
		),
    execute: async function (interaction) {
		const voiceChannelId = getPlayableVoiceChannelId(interaction);
		if (voiceChannelId == null)
            return await interaction.reply({ content: LANG.common.message.notPlayableError, ephemeral: true });

		const player = useMainPlayer();
		const query = interaction.options.get(LANG.commands.play.options.query.name).value;

		await interaction.deferReply();

		try {
			const searchResult = await player.search(query, { requestedBy: interaction.user, searchEngine: QueryType.AUTO });

    		if (!searchResult || searchResult.tracks.length == 0 || !searchResult.tracks) {
    		  return interaction.followUp(LANG.commands.play.notFound);
    		}
    		const res = await player.play(voiceChannelId, searchResult, {
    		  nodeOptions: {
    		    metadata: {
    		      channel: interaction.channel,
    		      client: interaction.guild.members.me,
    		      requestedBy: interaction.user,
    		    },
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
			const message = strFormat(LANG.commands.play.trackAdded, ['**' + (res.track.playlist
				? strFormat(LANG.common.message.playerTrack, { title: res.track.playlist.title, duration })
				: strFormat(LANG.commands.play.authorAndTrack, {
					author: res.track.author,
					track: strFormat(LANG.common.message.playerTrack, { title: res.track.title, duration })
				})) + '**']);

			return interaction.followUp({
				embeds: [{
					title: message,
					color: 0x5865f2,
					footer: {
                        text: strFormat(LANG.commands.play.requestedBy, [interaction.user.tag])
                    },
				}]
			})
		} catch (e) {
			// let's return error if something failed
			console.error(e);
			return interaction.followUp(strFormat(LANG.commands.play.generalError, [e]));
		}


    }
};