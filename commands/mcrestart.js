const { SlashCommandBuilder } = require('@discordjs/builders');


// いいかんじに
module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('サーバーを再起動します。')
		.addStringOption(option => 
			option
				.setName('target')
				.setDescription('再起動するサーバーを選択')
				.addChoice('メインサーバー', 'main')
				.addChoice('クリエイティブサーバー', 'creative')
				.addChoice('PvPサーバー', 'pvp'),
		),
    execute: async function (interaction) {
        const target = interaction.options.getString('target');

		if (target === 'main') {
			await interaction.reply(`Selected ${target}.`);
		}
		if (target === 'creative') {
			await interaction.reply(`Selected ${target}.`);
		}
		if (target === 'pvp') {
			await interaction.reply(`Selected ${target}.`);
		} else {
			await interaction.reply(`Unknown Target. (${target})`);
		}
    }
};