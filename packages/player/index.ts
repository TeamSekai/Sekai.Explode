import assert from 'assert';
import { GuildQueue, Player } from 'discord-player';
import { LANG, strFormat } from '../../util/languages';
import { CommandManager } from '../../internal/commands';
import {
	restoreQueues,
	saveQueue,
	getDuration,
	deleteSavedQueues,
} from './players';
import { Feature } from '../../util/types';
import { Client } from 'discord.js';

class PlayerFeature implements Feature {
	/** @type {Player | null} */
	#player: Player | null = null;

	onLoad(client: Client<boolean>) {
		console.log(LANG.discordbot.main.playerLoading);
		const player = new Player(client);
		player.extractors.loadDefault();
		this.#player = player;

		CommandManager.default.addCommands([
			require('./commands/pause'),
			require('./commands/play'),
			require('./commands/queue'),
			require('./commands/resume'),
			require('./commands/skip'),
			require('./commands/stop'),
			require('./commands/volume'),
		]);

		player.events.on('playerStart', (queue, track) => {
			// we will later define queue.metadata object while creating the queue
			// queue.metadata.channel.send(`**${track.title}**を再生中`);
			const requestedBy = queue.currentTrack?.requestedBy;
			assert(requestedBy != null);
			queue.metadata.channel.send({
				embeds: [
					{
						title: strFormat(LANG.discordbot.playerStart.playingTrack, [
							'**' +
								strFormat(LANG.common.message.playerTrack, {
									title: track.title,
									duration: getDuration(track),
								}) +
								'**',
						]),
						thumbnail: {
							url: track.thumbnail,
						},
						footer: {
							text: strFormat(LANG.discordbot.playerStart.requestedBy, [
								requestedBy.tag,
							]),
						},
						color: 0x5865f2,
					},
				],
			});
		});

		player.events.on('playerFinish', (queue) =>
			deleteSavedQueues(queue.guild.id),
		);
		player.events.on('queueDelete', (queue) =>
			deleteSavedQueues(queue.guild.id),
		);

		player.on('error', () => console.log(LANG.discordbot.playerError.message));
	}

	async onClientReady() {
		assert(this.#player != null);
		await restoreQueues(this.#player);
	}

	async onUnload() {
		console.log('Saving queues');
		const player = this.#player;
		assert(player != null);
		for (const [guildId, queue] of player.nodes.cache) {
			console.log(guildId);
			await saveQueue(queue as GuildQueue<any>);
		}
		await player.destroy();
	}
}

export const feature = new PlayerFeature();
