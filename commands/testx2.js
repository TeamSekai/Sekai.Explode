const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('idk')
        .setDescription('shitcord code test')
		.addSubcommand(subcommand =>
			subcommand
				.setName('01')
				.setDescription('db ins')
				.addStringOption(option => (
					option
						.setName("str")
						.setDescription("type here")
						.setRequired(false)
				))
		),
    execute: async function (interaction) {
		/** @type {import("discord.js").CommandInteraction} */
		await interaction.reply(`soon`)
    }
};