const { SlashCommandBuilder } = require('discord.js');
const { getPlayableVoiceChannelId, getPlayingQueue } = require('../util/players');
const { LANG } = require('../util/languages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.stop.name)
        .setDescription(LANG.commands.stop.description),
    execute: async function (interaction) {
        if (getPlayableVoiceChannelId(interaction) == null) 
            return await interaction.reply({ content: LANG.common.message.notPlayableError, ephemeral: true });

        const queue = getPlayingQueue(interaction);
		if (!queue)
			return await interaction.reply({ content: LANG.common.message.noTracksPlayed, ephemeral: true });

        queue.delete();
        await interaction.reply(LANG.commands.stop.playerStopped);
    }
};
