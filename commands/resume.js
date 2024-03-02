// @ts-check

const { SlashCommandBuilder } = require('discord.js');
const { LANG } = require('../util/languages');
const {
	getPlayableVoiceChannelId,
	getPlayingQueue,
} = require('../util/players');

/** @type {import("../util/types").Command} */
const commandResume = {
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
