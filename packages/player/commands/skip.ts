import assert from 'assert';
import { SlashCommandBuilder } from 'discord.js';
import { LANG, strFormat } from '../../../util/languages';
import { PlayerCommand } from '../PlayerCommand';

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
				assert.fail();
			}
			await interaction.reply({
				embeds: [
					{
						title: strFormat(LANG.commands.skip.trackSkipped, [
							'**' + currentTrack.title + '**',
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
					.join('\n'),
			);
		}
	},
);
