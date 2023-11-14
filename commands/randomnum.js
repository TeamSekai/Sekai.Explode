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
        min = Math.ceil(interaction.options.getInteger("min_value"));
        max = Math.floor(interaction.options.getInteger("max_value"));
		const result = Math.floor(Math.random() * (max - min) + min);
		await interaction.reply(`結果: ${result}`)
    }
};