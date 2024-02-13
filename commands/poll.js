const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('idk')
        .setDescription('shitcord code test')
		.addStringOption(option => option.setName('title').setDescription('Pollのタイトル').setRequired(true)),
    execute: async function (interaction) {
		/** @type {import("discord.js").CommandInteraction} */
		await interaction.reply(`soon`)
    }
};