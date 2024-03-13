import { SlashCommandBuilder } from 'discord.js';
import { LANG } from '../../../util/languages';
import { getPlayableVoiceChannelId, getPlayingQueue } from '../players';
import { Command } from '../../../util/types';

const commandResume: Command = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.resume.name)
		.setDescription(LANG.commands.resume.description),

	async execute(interaction) {
		if (getPlayableVoiceChannelId(interaction) == null) {
			await interaction.reply({
				content: LANG.common.message.notPlayableError,
				ephemeral: true,
			});
			return;
		}

		const queue = getPlayingQueue(interaction);
		if (!queue) {
			await interaction.reply({
				content: LANG.common.message.noTracksPlayed,
				ephemeral: true,
			});
			return;
		}

		const success = queue.node.resume();
		if (success) {
			await interaction.reply(LANG.commands.resume.playerResumed);
		} else {
			await interaction.reply(LANG.commands.resume.resumeFailed);
		}
	},
};

module.exports = commandResume;
