// @ts-check

const { LANG, strFormat } = require('../../../util/languages');
const { SimpleSlashCommandBuilder } = require('../../../common/SimpleCommand');

const DEFAULT_MIN_VALUE = 0;
const DEFAULT_MAX_VALUE = 99;
const DEFAULT_DICE_COUNT = 1;

module.exports = SimpleSlashCommandBuilder.create(
	LANG.commands.randomnum.name,
	LANG.commands.randomnum.description,
)
	.addIntegerOption({
		name: LANG.commands.randomnum.options.minValue.name,
		description: strFormat(
			LANG.commands.randomnum.options.minValue.description,
			DEFAULT_MIN_VALUE,
		),
		required: false,
		min_value: 0,
	})
	.addIntegerOption({
		name: LANG.commands.randomnum.options.maxValue.name,
		description: strFormat(
			LANG.commands.randomnum.options.maxValue.description,
			DEFAULT_MAX_VALUE,
		),
		required: false,
		min_value: 0,
	})
	.addIntegerOption({
		name: LANG.commands.randomnum.options.diceCount.name,
		description: strFormat(
			LANG.commands.randomnum.options.diceCount.description,
			DEFAULT_DICE_COUNT,
		),
		required: false,
		min_value: 1,
		max_value: 50,
	})
	.build(async function execute(
		interaction,
		min = DEFAULT_MIN_VALUE,
		max = DEFAULT_MAX_VALUE,
		diceCount = DEFAULT_DICE_COUNT,
	) {
		if (min > max) {
			await interaction.reply({
				content: strFormat(LANG.commands.randomnum.boundError, { min, max }),
				ephemeral: true,
			});
			return;
		}
		const result = [];
		const range = max - min + 1;
		for (let i = 0; i < diceCount; i++) {
			const value = Math.floor(Math.random() * range + min);
			result.push(value);
		}
		await interaction.reply({
			embeds: [
				{
					title: LANG.commands.randomnum.result.title,
					description: strFormat(LANG.commands.randomnum.result.description, {
						min,
						max,
						count: diceCount,
						representation: `${diceCount}D${range}`,
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
	});
