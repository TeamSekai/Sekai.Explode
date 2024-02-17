const { SlashCommandBuilder } = require('discord.js');
const { LANG } = require('../util/languages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.poll.name)
        .setDescription(LANG.commands.poll.description),
    execute: async function (interaction) {
        // await interaction.reply(LANG.commands.poll.message)
    }
};