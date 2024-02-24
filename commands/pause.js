// @ts-check

const { SlashCommandBuilder } = require("discord.js");
const { LANG } = require("../util/languages");
const { getPlayableVoiceChannelId, getPlayingQueue, saveQueue } = require("../util/players");

/** @type {import("../util/types").Command} */
const commandPause = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.pause.name)
        .setDescription(LANG.commands.pause.description),

    async execute(interaction) {
        if (getPlayableVoiceChannelId(interaction) == null) {
            await interaction.reply({ content: LANG.common.message.notPlayableError, ephemeral: true });
            return;
        }

        const queue = getPlayingQueue(interaction);
		if (!queue) {
			await interaction.reply({ content: LANG.common.message.noTracksPlayed, ephemeral: true });
            return;
        }

        const success = queue.node.pause();
        if (success) {
            await interaction.reply(LANG.commands.pause.playerPaused);
        } else {
            await interaction.reply(LANG.commands.pause.pauseFailed);
        }
    }
};

module.exports = commandPause;
