const { SlashCommandBuilder } = require("discord.js");
const { LANG, strFormat } = require("../util/languages");

function GenNum() {
	const min = 1;
	const max = 5;
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.omikuzi.name)
		.setDescription(LANG.commands.omikuzi.description),
	execute: async function (interaction) {
		let number = GenNum();
		if (number == 1) {
			await interaction.reply(LANG.commands.omikuzi.badLuck);
			return;
		}
		if (number == 2) {
			await interaction.reply(LANG.commands.omikuzi.goodLuck);
			return;
		}
		if (number == 3) {
			await interaction.reply(LANG.commands.omikuzi.slightGoodLuck);
			return;
		}
		if (number == 4) {
			await interaction.reply(LANG.commands.omikuzi.moderateGoodLuck);
			return;
		}
		if (number == 5) {
			await interaction.reply(LANG.commands.omikuzi.greatGoodLuck);
			return;
		}
		await interaction.reply(
			strFormat(LANG.commands.omikuzi.assertionError, [number]),
		);
	},
};
