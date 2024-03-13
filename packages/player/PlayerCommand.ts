const { getPlayableVoiceChannelId, getPlayingQueue } = require('./players');
const { LANG } = require('../../util/languages');

/**
 * @typedef {import("../../util/types").Command} Command
 */

/**
 * @typedef {import('./players').QueueMetadata} QueueMetadata
 */

/**
 * 音楽プレイヤーの操作を行うコマンド。
 * コマンドを実行したユーザーがボイスチャンネルに参加していて、
 * かつ音楽が再生されている場合に action 関数を呼び出す。
 * @implements {Command}
 */
export class PlayerCommand {
	data;

	action;

	/**
	 *
	 * @param {import("discord.js").SlashCommandBuilder} data
	 * @param {(interaction: import("discord.js").ChatInputCommandInteraction,
	 *          queue: import("discord-player").GuildQueue<QueueMetadata>,
	 *          voiceChannelId: string) => Promise<void>} action 音楽プレイヤーの操作。チェックを行った後に呼び出される。
	 */
	constructor(data, action) {
		this.data = data;
		this.action = action;
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
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
