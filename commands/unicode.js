const { SlashCommandBuilder } = require('discord.js');
const { LANG } = require('../util/languages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.unicode.name)
		.setDescription(LANG.commands.unicode.description)
		.addStringOption((option) =>
			option
				.setName(LANG.commands.unicode.options.mode.name)
				.setDescription(LANG.commands.unicode.options.mode.description)
				.setRequired(true)
				.addChoices({
					name: LANG.commands.unicode.options.mode.choices.encode,
					value: 'encode',
				})
				.addChoices({
					name: LANG.commands.unicode.options.mode.choices.decode,
					value: 'decode',
				}),
		)
		.addStringOption((option) =>
			option
				.setName(LANG.commands.unicode.options.text.name)
				.setDescription(LANG.commands.unicode.options.text.description)
				.setRequired(true),
		),
	execute: async function (interaction) {
		const mode = interaction.options.getString(
			LANG.commands.unicode.options.mode.name,
		);
		const text = interaction.options.getString(
			LANG.commands.unicode.options.text.name,
		);

		if (mode === 'encode') {
			const unicodeArray = Array.from(text).map((char) => char.charCodeAt(0));
			const unicodeString = unicodeArray
				.map((code) => `\\u${code.toString(16).padStart(4, '0')}`)
				.join('');
			await interaction.reply({
				embeds: [
					{
						title: LANG.commands.unicode.textEncoded,
						fields: [
							{
								name: LANG.common.message.result,
								value: '```\n' + unicodeString + '\n```',
							},
						],
					},
				],
			});
		} else if (mode === 'decode') {
			const unicodeString = text.replace(/\\u[\dA-Fa-f]{4}/g, (match) =>
				String.fromCharCode(parseInt(match.slice(2), 16)),
			);
			await interaction.reply({
				embeds: [
					{
						title: LANG.commands.unicode.textDecoded,
						fields: [
							{
								name: LANG.common.message.result,
								value: '```\n' + unicodeString + '\n```',
							},
						],
					},
				],
			});
		}
	},
};
