const { SlashCommandBuilder } = require("discord.js");
const { LANG, strFormat } = require("../util/languages");
const {
	getPlayableVoiceChannelId,
	getPlayingQueue,
} = require("../util/players");
const players = require("../util/players");

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.volume.name)
		.setDescription(LANG.commands.volume.description)
		.addIntegerOption((option) =>
			option
				.setName(LANG.commands.volume.options.volume.name)
				.setDescription(LANG.commands.volume.options.volume.description)
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(100),
		)
		.addBooleanOption((option) =>
			option
				.setName(LANG.commands.volume.options.keep.name)
				.setDescription(LANG.commands.volume.options.keep.description)
				.setRequired(false),
		),
	execute: async function (
		/** @type {import("discord.js").CommandInteraction} */ interaction,
	) {
		const vol = interaction.options.getInteger(
			LANG.commands.volume.options.volume.name,
		);
		const keep =
			interaction.options.getBoolean(LANG.commands.volume.options.keep.name) ??
			false;

		const channel = getPlayableVoiceChannelId(interaction);
		if (channel == null) {
			return await interaction.reply({
				content: LANG.common.message.notPlayableError,
				ephemeral: true,
			});
		}

		const queue = getPlayingQueue(interaction);
		if (queue == null)
			return interaction.reply({
				content: LANG.common.message.noTracksPlayed,
				ephemeral: true,
			});

		try {
			if (keep) await players.saveVolumeSetting(interaction.guildId, vol);

			queue.node.setVolume(vol);
			interaction.reply(
				strFormat(
					keep
						? LANG.commands.volume.volumeSave
						: LANG.commands.volume.volumeSet,
					["**" + vol + "**"],
				),
			);
		} catch (e) {
			interaction.reply(
				LANG.commands.volume.error +
					"\n" +
					"```ansi\n" +
					"\x1b[31m" +
					e +
					"\n```",
			);
			console.error(e);
		}
	},
};
