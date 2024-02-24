// @ts-check

const { SlashCommandBuilder } = require('discord.js');
const { LANG } = require('../util/languages');
const { PlayerCommand } = require('../common/PlayerCommand');

module.exports = new PlayerCommand(
    new SlashCommandBuilder()
        .setName(LANG.commands.stop.name)
        .setDescription(LANG.commands.stop.description),

    async function(interaction, queue) {
        queue.delete();
        await interaction.reply(LANG.commands.stop.playerStopped);
    }
);
