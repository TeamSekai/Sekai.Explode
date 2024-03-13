import { SlashCommandBuilder } from 'discord.js';
import { LANG } from '../../../util/languages';
import { PlayerCommand } from '../PlayerCommand';

module.exports = new PlayerCommand(
	new SlashCommandBuilder()
		.setName(LANG.commands.stop.name)
		.setDescription(LANG.commands.stop.description),

	async function (interaction, queue) {
		queue.delete();
		await interaction.reply(LANG.commands.stop.playerStopped);
	},
);
