// @ts-check

const { LANG, strFormat } = require('../util/languages');
const {
	SimpleCommand,
	SimpleSlashCommandBuilder,
} = require('../common/SimpleCommand');

module.exports = new SimpleCommand(
	SimpleSlashCommandBuilder.create(
		LANG.commands.randomnum.name,
		LANG.commands.randomnum.description,
	)
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

	async function execute(interaction, min = 0, max = 100) {
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
);
