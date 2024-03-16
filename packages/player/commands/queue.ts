import { SlashCommandBuilder } from 'discord.js';
import Pager from '../../../util/pager';
import { getDuration } from '../players';
import Timespan from '../../../util/timespan';
import { LANG, strFormat } from '../../../util/languages';
import { PlayerCommand } from '../PlayerCommand';

module.exports = new PlayerCommand(
	new SlashCommandBuilder()
		.setName(LANG.commands.queue.name)
		.setDescription(LANG.commands.queue.description),

	async function (interaction, queue) {
		const queuedTracks = queue.tracks.toArray();
		const tracks = queuedTracks.map((track, idx) =>
			strFormat(LANG.commands.queue.queueItem, {
				index:
					'**' + strFormat(LANG.commands.queue.queueIndex, [idx + 1]) + '**',
				value: strFormat(LANG.common.message.playerTrack, {
					title: `[${track.title}](${track.url})`,
					duration: getDuration(track),
				}),
			}),
		);

		const chunkSize = 10;

		const pager = new Pager(tracks, {
			pageLength: chunkSize,
			color: 'Red',
			title: strFormat(LANG.commands.queue.result.title, {
				count: queue.tracks.size,
				duration: new Timespan({ millis: queue.estimatedDuration }),
			}),
			emptyMessage: '**' + LANG.commands.queue.result.emptyMessage + '**',
			footer: (pager) => ({
				// 丸括弧を付けないとブロックとして解釈されてしまうという罠
				text: strFormat(LANG.commands.queue.result.footer, {
					page: pager.page + 1,
					length: pager.items.length,
				}),
			}),
		});
		pager.replyTo(interaction);
	},
);
