const { SlashCommandBuilder } = require('discord.js');
const { LANG, strFormat } = require('../util/languages');
const rickurl =
	'https://paste-pgpj.onrender.com/?p=%3Ciframe%20width=%221280%22%20height=%22720%22%20src=%22https://www.youtube.com/embed/dQw4w9WgXcQ%22%20title=%22Rick%20Astley%20-%20Never%20Gonna%20Give%20You%20Up%20(Official%20Music%20Video)%22%20frameborder=%220%22%20allow=%22accelerometer;%20autoplay;%20clipboard-write;%20encrypted-media;%20gyroscope;%20picture-in-picture;%20web-share%22%20allowfullscreen%3E%3C/iframe%3E';

module.exports = [
	{
		data: new SlashCommandBuilder()
			.setName(LANG.commands.fake.freeNitro.name)
			.setDescription(LANG.commands.fake.freeNitro.description),
		execute: async function (interaction) {
			await interaction.reply(
				`[${LANG.commands.fake.freeNitro.linkText}](${rickurl})`,
			);
		},
	},
	{
		data: new SlashCommandBuilder()
			.setName(LANG.commands.fake.hackAdmin.name)
			.setDescription(LANG.commands.fake.hackAdmin.description),
		execute: async function (interaction) {
			await interaction.reply(
				strFormat(LANG.commands.fake.hackAdmin.message, [
					`[${LANG.commands.fake.hackAdmin.linkText}](${rickurl})`,
				]),
			);
		},
	},
];
