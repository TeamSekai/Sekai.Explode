const { SlashCommandBuilder } = require('discord.js');
const { LANG, strFormat } = require('../util/languages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.randomnum.name)
		.setDescription(LANG.commands.randomnum.description)
		.addIntegerOption((option) =>
			option
				.setName(LANG.commands.randomnum.options.minValue.name)
				.setDescription(LANG.commands.randomnum.options.minValue.description)
				.setRequired(false)
				.setMinValue(0),
		)
		.addIntegerOption((option) =>
			option
				.setName(LANG.commands.randomnum.options.maxValue.name)
				.setDescription(LANG.commands.randomnum.options.maxValue.description)
				.setRequired(false)
				.setMinValue(0),
		),

	execute: async function (interaction) {
		const min =
			Math.ceil(
				interaction.options.getInteger(
					LANG.commands.randomnum.options.minValue.name,
				),
			) ?? 0;
		const max = Math.floor(
			interaction.options.getInteger(
				LANG.commands.randomnum.options.maxValue.name,
			) ?? 100,
		);
		const result = Math.floor(Math.random() * (max - min) + min);
		await interaction.reply({
			embeds: [
				{
					title: LANG.commands.randomnum.result.title,
					description: strFormat(LANG.commands.randomnum.result.description, {
						min,
						max,
					}),
					color: 0x00fa9a,
					fields: [
						{
							name: LANG.common.message.result,
							value: '```\n' + result + '\n```',
						},
					],
					footer: {
						text: strFormat(LANG.commands.randomnum.result.footer, [
							interaction.user.username,
						]),
					},
				},
			],
		});
	},
};
