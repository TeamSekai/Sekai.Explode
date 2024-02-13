const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { LANG, strFormat } = require('../util/languages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.skip.name)
        .setDescription(LANG.commands.skip.description),
    execute: async function (interaction) {
        const queue = useQueue(interaction.guildId);

        const member = interaction.member;
        const channel = member.voice.channel;

        if (!channel) {
            return await interaction.reply({ content: LANG.common.message.notPlayableError, ephemeral: true });
        }

		if (
			interaction.guild.members.me.voice.channelId &&
			interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId
		)
			return await interaction.reply({ content: LANG.common.message.notPlayableError, ephemeral: true });

		const queuedTracks = queue.tracks.toArray();
    	if (!queuedTracks[0])
    	  return interaction.reply({ content: LANG.common.message.noTracksPlayed, ephemeral: true });

        try {
			queue.node.skip()
        	await interaction.reply({
				embeds: [{
					title: strFormat(LANG.commands.skip.trackSkipped, ['**' + queue.currentTrack.title + '**']),
					thumbnail: {
						url: queue.currentTrack.thumbnail
					},
					color: 0x5865f2,
				}]
			})
		} catch (e) {
			interaction.reply(strFormat(LANG.commands.skip.generalError, [e]));
		}
    }
};