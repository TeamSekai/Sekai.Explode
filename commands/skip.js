// @ts-check

const { SlashCommandBuilder } = require("discord.js");
const { LANG, strFormat } = require("../util/languages");
const { PlayerCommand } = require("../common/PlayerCommand");
const { AssertionError } = require("../util/assertion");

module.exports = new PlayerCommand(
	new SlashCommandBuilder()
		.setName(LANG.commands.skip.name)
		.setDescription(LANG.commands.skip.description),

	async function (interaction, queue) {
		const queuedTracks = queue.tracks.toArray();
		if (!queuedTracks[0]) {
			await interaction.reply({
				content: LANG.common.message.noTracksPlayed,
				ephemeral: true,
			});
			return;
		}

		try {
			queue.node.skip();
			const currentTrack = queue.currentTrack;
			if (currentTrack == null) {
				throw new AssertionError();
			}
			await interaction.reply({
				embeds: [
					{
						title: strFormat(LANG.commands.skip.trackSkipped, [
							"**" + currentTrack.title + "**",
						]),
						thumbnail: {
							url: currentTrack.thumbnail,
						},
						color: 0x5865f2,
					},
				],
			});
		} catch (e) {
			await interaction.reply(
				LANG.commands.skip.generalError
					.map((s) => strFormat(s, [e]))
					.join("\n"),
			);
		}
	},
);
