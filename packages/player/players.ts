import {
	BaseInteraction,
	GuildMember,
	GuildVoiceChannelResolvable,
	TextBasedChannel,
	User,
} from 'discord.js';
import {
	useQueue,
	Track,
	useMainPlayer,
	Player,
	GuildQueue,
	TrackLike,
	GuildNodeCreateOptions,
} from 'discord-player';
import Timespan from '../../util/timespan';
import mongodb from '../../internal/mongodb';
import { Collection } from 'mongoose';

/** volumes コレクションのドキュメント */
interface VolumeSchema {
	/** ギルド ID */
	guild: string;

	/** サーバーで設定されている音量 */
	volume: number;
}

/** guild_queue コレクションのドキュメント */
interface GuildQueueSchema {
	/** ギルド ID */
	_id: string;

	/** キューのボイスチャンネルの ID */
	voiceChannel: string | null;

	/** 一時停止中か */
	is_paused: boolean;

	/** このキューの現在の曲 */
	current_track: ReturnType<typeof Track.prototype.serialize> | null;

	/** 曲の現在の再生位置 (ミリ秒) */
	current_time: number | null;

	/** コマンドが実行されたテキストチャンネルの ID */
	textChannel: string | null;

	/** コマンドを受け取ったクライアントの ID */
	client: string | null;

	/** コマンドの実行者の ID */
	requested_by: string;
}

/** guild_queue_tracks コレクションのドキュメント */
interface GuildQueueTrackSchema {
	/** ギルド ID */
	guild: string;

	/** 曲のキュー内での番号 (0始まり) */
	index: number;

	/** キュー内の曲 */
	track: ReturnType<typeof Track.prototype.serialize>;
}

/** キューに付加するメタデータ */
export interface QueueMetadata {
	/** コマンドが実行されたテキストチャンネル */
	channel: TextBasedChannel | null;

	/** コマンドを受け取ったクライアント */
	client: GuildMember | null;

	/** コマンドの実行者 */
	requestedBy: User;
}

/**
 * データベースから読み出したドキュメントを元にキューの復元する。
 * @returns キューが復元されたか
 */
async function restoreQueue(
	player: Player,
	guildQueueDocument: GuildQueueSchema,
) {
	const currentTrackSerialized = guildQueueDocument.current_track;
	const currentTime = guildQueueDocument.current_time;
	const voiceChannelId = guildQueueDocument?.voiceChannel;
	if (
		currentTrackSerialized == null ||
		currentTime == null ||
		voiceChannelId == null
	) {
		return false;
	}

	const client = player.client;
	const voiceChannel = await client.channels.fetch(voiceChannelId);
	const isPaused = guildQueueDocument.is_paused;
	if (
		voiceChannel == null ||
		!voiceChannel.isVoiceBased() ||
		(!isPaused && voiceChannel.members.size == 0)
	) {
		return false;
	}

	const guild = await client.guilds.fetch(guildQueueDocument._id);
	const textChannelId = guildQueueDocument.textChannel;
	const textChannel = textChannelId
		? (await guild.channels.fetch(textChannelId)) ?? null
		: null;
	if (textChannel == null || !textChannel.isTextBased()) {
		return false;
	}

	const nodeOptions = await functions.getNodeOptions(guild.id, {
		channel: textChannel,
		client: guild.members.me,
		requestedBy: (await guild.members.fetch(guildQueueDocument.requested_by))
			.user,
	});
	const queue = player.nodes.create(guild, nodeOptions);
	const currentTrack = Track.fromSerialized(player, currentTrackSerialized);
	await queue.connect(voiceChannelId);
	await queue.play(currentTrack, {
		audioPlayerOptions: {
			seek: currentTime,
		},
		nodeOptions: {
			...nodeOptions,
		},
	});
	if (guildQueueDocument.is_paused) {
		queue.dispatcher?.on('start', (resource) => resource.audioPlayer?.pause());
	}
	queue.addTrack(await functions.getSavedTracks(player, guild.id));
	return true;
}

/**
 * 音楽プレイヤーに関わるユーティリティ関数群。
 */
const functions = {
	/**
	 * 対話を起こしたメンバーが接続していて、この bot が参加しているか参加できるボイスチャンネルの ID を取得する。
	 * @param interaction 対話オブジェクト
	 * @returns メンバーが接続しているボイスチャンネルの ID。この bot が接続できる状態にない場合は null
	 */
	getPlayableVoiceChannelId(interaction: BaseInteraction) {
		const member = interaction.member;
		if (!(member instanceof GuildMember)) {
			return null;
		}
		const memberVC = member.voice.channelId;
		const myVC = interaction?.guild?.members?.me?.voice.channelId;

		if (memberVC != null && (myVC === memberVC || myVC == null))
			return memberVC;
		else return null;
	},

	/**
	 * 対話が起こったサーバーで再生されている楽曲のキューを取得する。
	 * @param interaction 対話オブジェクト
	 * @returns 楽曲を再生している場合、楽曲のキュー。再生していない場合、null
	 */
	getPlayingQueue(
		interaction: BaseInteraction,
	): GuildQueue<QueueMetadata> | null {
		const guildId = interaction.guild;
		if (guildId == null) {
			return null;
		}
		const queue = useQueue(guildId) as GuildQueue<QueueMetadata>;
		if (queue?.isPlaying()) {
			return queue;
		}

		return null;
	},

	/**
	 * トラックの長さを求める。
	 * @param track トラック
	 * @returns トラックの長さ
	 */
	getDuration(track: Track<unknown>) {
		return new Timespan({ millis: track.durationMS });
	},

	/**
	 * サーバーでの音量設定を保存する。
	 * @param guildId ギルド ID
	 * @param volume 音量
	 */
	async saveVolumeSetting(guildId: string, volume: number) {
		const volumeCollection =
			mongodb.connection.collection<VolumeSchema>('volumes');
		await volumeCollection.updateOne(
			{ guild: guildId },
			{
				$set: {
					guild: guildId,
					volume: volume,
				},
			},
			{ upsert: true },
		);
	},

	/**
	 * サーバーでの音量設定を取得する。
	 * @param guildId ギルド ID
	 * @returns 音量
	 */
	async loadVolumeSetting(guildId: string): Promise<number | undefined> {
		const volumeCollection =
			mongodb.connection.collection<VolumeSchema>('volumes');
		const result = await volumeCollection.findOne({ guild: guildId });
		if (result != null) {
			return result.volume;
		}
	},

	/**
	 * 音楽の再生を開始する。
	 * @param guild ギルド ID
	 * @param channel 再生するボイスチャンネル
	 * @param query 再生する曲または音源
	 * @param metadata 付加するメタデータ
	 */
	async play<T = unknown>(
		guild: string,
		channel: GuildVoiceChannelResolvable,
		query: TrackLike,
		metadata?: T,
	) {
		return await useMainPlayer().play(channel, query, {
			nodeOptions: await functions.getNodeOptions(guild, metadata),
		});
	},

	/**
	 * ノードのオプションを取得する。
	 * @param guild ギルド
	 * @param metadata 付加するメタデータ
	 * @returns ノードのオプション
	 */
	async getNodeOptions<T = unknown>(
		guild: string,
		metadata?: T,
	): Promise<GuildNodeCreateOptions<T>> {
		const volume = await functions.loadVolumeSetting(guild);
		return {
			metadata,
			bufferingTimeout: 15_000,
			leaveOnStop: true,
			leaveOnStopCooldown: 5_000,
			leaveOnEnd: true,
			leaveOnEndCooldown: 15_000,
			leaveOnEmpty: true,
			leaveOnEmptyCooldown: 300_000,
			volume,
		};
	},

	/**
	 * 現在のキューの状態をデータベースに保存する。
	 * @param queue キュー
	 */
	async saveQueue(queue: GuildQueue<QueueMetadata>) {
		const guild = queue.guild.id;
		const metadata = queue.metadata;

		const guildQueueCollection =
			mongodb.connection.collection<GuildQueueSchema>('guild_queues');
		await guildQueueCollection.deleteOne({ _id: guild });
		await guildQueueCollection.insertOne({
			_id: guild,
			voiceChannel: queue.channel?.id ?? null,
			is_paused: queue.node.isPaused(),
			current_track: queue.currentTrack?.serialize() ?? null,
			current_time: queue.node.estimatedPlaybackTime,
			textChannel: metadata.channel?.id ?? null,
			client: metadata.client?.id ?? null,
			requested_by: metadata.requestedBy.id,
		});

		const guildQueueTrackCollection =
			mongodb.connection.collection<GuildQueueTrackSchema>(
				'guild_queue_tracks',
			);
		const tracks = queue.tracks.toArray();
		await guildQueueTrackCollection.deleteMany({ guild });
		await guildQueueTrackCollection.insertMany(
			tracks.map((track, index) => ({
				guild,
				index,
				track: track.serialize(),
			})),
		);
	},

	/**
	 * データベースに保存されたキューを削除する。
	 * @param {string[]} guilds ギルド ID
	 */
	async deleteSavedQueues(...guilds: string[]) {
		const guildQueueCollection =
			mongodb.connection.collection<GuildQueueSchema>('guild_queues');
		await guildQueueCollection.deleteMany({
			_id: { $in: guilds },
		});
		/** @type {import("mongoose").Collection<GuildQueueTrackSchema>} */
		const guildQueueTrackCollection =
			mongodb.connection.collection<GuildQueueTrackSchema>(
				'guild_queue_tracks',
			);
		await guildQueueTrackCollection.deleteMany({
			guild: { $in: guilds },
		});
	},

	/**
	 * データベースに保存されたキューの状態を復元する。
	 * @param player プレイヤー
	 */
	async restoreQueues(player: Player) {
		const guildQueueCollection =
			mongodb.connection.collection<GuildQueueSchema>('guild_queues');
		const guildQueueDocuments = guildQueueCollection.find({});
		const guildsToDeleteQueues = [];
		for await (const guildQueueDocument of guildQueueDocuments) {
			const restored = await restoreQueue(player, guildQueueDocument);
			if (!restored) {
				guildsToDeleteQueues.push(guildQueueDocument._id);
			}
		}
		functions.deleteSavedQueues(...guildsToDeleteQueues);
	},

	/**
	 * データベースに保存された曲を取得する。
	 * @param player プレイヤー
	 * @param guild ギルド ID
	 */
	async getSavedTracks(player: Player, guild: string) {
		const guildQueueTrackCollection =
			mongodb.connection.collection<GuildQueueTrackSchema>(
				'guild_queue_tracks',
			);
		const guildQueueTrackDocuments = guildQueueTrackCollection.find({ guild });
		const result = [];
		for await (const { index, track } of guildQueueTrackDocuments) {
			result[index] = Track.fromSerialized(player, track);
		}
		return result;
	},
};

const {
	getPlayableVoiceChannelId,
	getPlayingQueue,
	getDuration,
	saveVolumeSetting,
	loadVolumeSetting,
	play,
	getNodeOptions,
	saveQueue,
	deleteSavedQueues,
	restoreQueues,
	getSavedTracks,
} = functions;

export {
	getPlayableVoiceChannelId,
	getPlayingQueue,
	getDuration,
	saveVolumeSetting,
	loadVolumeSetting,
	play,
	getNodeOptions,
	saveQueue,
	deleteSavedQueues,
	restoreQueues,
	getSavedTracks,
};
