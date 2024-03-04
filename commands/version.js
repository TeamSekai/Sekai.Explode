const { SlashCommandBuilder } = require('discord.js');
const os = require('os');
const { LANG, strFormat } = require('../util/languages');

// いいかんじに
module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.version.name)
		.setDescription(LANG.commands.version.description),
	execute: async function (interaction) {
		await interaction.reply(
			strFormat(LANG.commands.version.message, {
				process: process.version,
				os: os.version,
			}),
		);
	},
};
