const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random_num')
        .setDescription('乱数生成')
		.addIntegerOption(option =>
			option
				.setName("min_value")
				.setDescription("最大値を指定(デフォルト: 0)")
				.setRequired(false)
				.setMinValue(0)
		)
		.addIntegerOption(option =>
			option
				.setName("max_value")
				.setDescription("最大値を指定(デフォルト: 100)")
				.setRequired(false)
				.setMinValue(0)
		),

    execute: async function (interaction) {
		if (interaction.options.getInteger("min_value")) {
			min = Math.ceil(interaction.options.getInteger("min_value"));
		} else {
			min = 0
		}
        if (interaction.options.getInteger("max_value")) {
			max = Math.floor(interaction.options.getInteger("max_value"));
		} else {
			max = 100
		}
		const result = Math.floor(Math.random() * (max - min) + min);
		await interaction.reply({
			embeds: [{
				title: "乱数を生成しました!",
				description: `最小値: ${min}, 最大値: ${max}`,
				color: 0x00fa9a,
				fields: [{
					name: "結果:",
					value: "```\n" + result + "\n```",
				}],
				footer: {
					text: `実行者: ${interaction.user.username}`
				}
			}]
		})
    }
};