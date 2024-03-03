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
		)
		.addIntegerOption((option) =>
			option
				.setName(LANG.commands.randomnum.options.diceCount.name)
				.setDescription(LANG.commands.randomnum.options.diceCount.description)
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(50),
		),

	async function execute(interaction, min = 0, max = 100, diceCount = 1) {
		const result = [];
		for (let i = 0; i < diceCount; i++) {
			result.push(Math.floor(Math.random() * (max - min) + min));
		}
		await interaction.reply({
			embeds: [
				{
					title: LANG.commands.randomnum.result.title,
					description: strFormat(LANG.commands.randomnum.result.description, {
						min,
						max,
						count: diceCount,
						representation: `${diceCount}D${max - min}`,
					}),
					color: 0x00fa9a,
					fields: [
						{
							name: LANG.common.message.result,
							value: '```\n' + result.join(', ') + '\n```',
						},
						{
							name: LANG.commands.randomnum.result.sumFieldName,
							value: '```\n' + result.reduce((a, b) => a + b, 0) + '\n```',
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
