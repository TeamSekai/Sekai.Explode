import { SlashCommandBuilder } from 'discord.js';
import { LANG } from '../../../util/languages';
import { PlayerCommand } from '../PlayerCommand';

module.exports = new PlayerCommand(
	new SlashCommandBuilder()
		.setName(LANG.commands.pause.name)
		.setDescription(LANG.commands.pause.description),

	async function (interaction, queue) {
		const success = queue.node.pause();
		if (success) {
			await interaction.reply(LANG.commands.pause.playerPaused);
		} else {
			await interaction.reply(LANG.commands.pause.pauseFailed);
		}
	},
);
