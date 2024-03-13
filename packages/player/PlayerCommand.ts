import { getPlayableVoiceChannelId, getPlayingQueue } from './players';
import { LANG } from '../../util/languages';
import { Command } from '../../util/types';
import { QueueMetadata } from './players';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { GuildQueue } from 'discord-player';

/**
 * 音楽プレイヤーの操作を行うコマンド。
 * コマンドを実行したユーザーがボイスチャンネルに参加していて、
 * かつ音楽が再生されている場合に action 関数を呼び出す。
 */
export class PlayerCommand implements Command {
	data;

	action;

	/**
	 * @param action 音楽プレイヤーの操作。チェックを行った後に呼び出される。
	 */
	constructor(
		data: SlashCommandBuilder,
		action: (
			interaction: ChatInputCommandInteraction,
			queue: GuildQueue<QueueMetadata>,
			voiceChannelId: string,
		) => Promise<void>,
	) {
		this.data = data;
		this.action = action;
	}

	/**
	 * @param interaction
	 */
	async execute(interaction: ChatInputCommandInteraction) {
		const voiceChannelId = getPlayableVoiceChannelId(interaction);
		if (voiceChannelId == null) {
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

		this.action(interaction, queue, voiceChannelId);
	}
}
