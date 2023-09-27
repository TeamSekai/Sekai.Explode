const { SlashCommandBuilder } = require('@discordjs/builders');

function GenNum() {
	const min = 1;
	const max = 5;
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('おみくじ')
		.setDescription('何が出るかな'),
	execute: async function(interaction) {
		let number = GenNum();
		if (number == 1) {
			await interaction.reply(`凶`);
			return;
		}
		if (number == 2) {
			await interaction.reply(`吉`);
			return;
		}
		if (number == 3) {
			await interaction.reply(`小吉`);
			return;
		}
		if (number == 4) {
			await interaction.reply(`中吉`);
			return;
		}
		if (number == 5) {
			await interaction.reply(`大吉`);
			return;
		}
		await interaction.reply(`エラー(function result: ${number}) - ボットが燃えました`);
	},
};
