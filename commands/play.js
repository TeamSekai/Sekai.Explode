const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { useMainPlayer, QueryType, Track } = require('discord-player');
const { getPlayableVoiceChannelId, getDuration, loadVolumeSetting } = require('../util/players');
const { LANG, strFormat } = require('../util/languages');
const Timespan = require('../util/timespan');
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
    execute: async function (/** @type {CommandInteraction<unknown>} */ interaction) {
        const voiceChannelId = getPlayableVoiceChannelId(interaction);
        if (voiceChannelId == null)
            return await interaction.reply({ content: LANG.common.message.notPlayableError, ephemeral: true });

        const player = useMainPlayer();
        const query = interaction.options.get(LANG.commands.play.options.query.name).value;

        await interaction.deferReply();

        try {
            const vol = await loadVolumeSetting(interaction.guildId);

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
                    // volume: 5,
                    bufferingTimeout: 15000,
                    leaveOnStop: true,
                    leaveOnStopCooldown: 5000,
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 15000,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 300000,
                    skipOnNoStream: true,
                    volume: vol
                },
            });

            const message = toTrackAddedMessage(res.track);

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

/**
 * @param {Track} track
 */
function toTrackAddedMessage(track) {
    const message = strFormat(LANG.commands.play.trackAdded, ['**' + trackToString(track) + '**']);
    return message;
}

/**
 * @param {Track} track
 */
function trackToString(track) {
    const playlist = track.playlist;
    if (playlist) {
        return strFormat(LANG.common.message.playerTrack, {
            title: track.playlist.title,
            duration: new Timespan({ millis: playlist.estimatedDuration })
        });
    } else {
        return strFormat(LANG.commands.play.authorAndTrack, {
            author: track.author,
            track: strFormat(LANG.common.message.playerTrack, {
                title: track.title,
                duration: getDuration(track)
            })
        });
    }
}