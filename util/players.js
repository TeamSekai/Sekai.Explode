// @ts-check

const { GuildMember, User } = require('discord.js');
const { useQueue, Track, GuildQueue, useMainPlayer, Player } = require('discord-player');
const { Collection } = require('mongoose');
const Timespan = require('./timespan');
const mongodb = require('../internal/mongodb');

/**
 * @typedef {Object} VolumeSchema volumes コレクションのドキュメント
 * @property {string} guild ギルド ID
 * @property {number} volume サーバーで設定されている音量
 */

/**
 * @typedef {Object} GuildQueueSchema guild_queue コレクションのドキュメント
 * @property {string} _id ギルド ID
 * @property {string | null} voiceChannel キューのボイスチャンネルの ID
 * @property {ReturnType<typeof Track.prototype.serialize> | null} current_track このキューの現在の曲
 * @property {number | null} current_time 曲の現在の再生位置 (ミリ秒)
 * @property {string | null} textChannel コマンドが実行されたテキストチャンネルの ID
 * @property {string | null} client コマンドを受け取ったクライアントの ID
 * @property {string} requested_by コマンドの実行者の ID
 */

/**
 * @typedef {Object} GuildQueueTrackSchema guild_queue_tracks コレクションのドキュメント
 * @property {string} guild ギルド ID 
 * @property {number} index 曲のキュー内での番号 (0始まり)
 * @property {ReturnType<typeof Track.prototype.serialize>} track キュー内の曲
 */

/**
 * @typedef {Object} QueueMetadata キューに付加するメタデータ
 * @property {import('discord.js').TextBasedChannel | null} channel コマンドが実行されたテキストチャンネル
 * @property {GuildMember | null} client コマンドを受け取ったクライアント
 * @property {User} requestedBy コマンドの実行者
 */

/**
 * データベースから読み出したドキュメントを元にキューの再生を再開する。
 * @param {Player} player
 * @param {GuildQueueSchema} guildQueueDocument
 * @returns キューの再生が再開されたか
 */
async function restoreQueue(player, guildQueueDocument) {
    const currentTrackSerialized = guildQueueDocument.current_track;
    const currentTime = guildQueueDocument.current_time;
    const voiceChannelId = guildQueueDocument?.voiceChannel;
    if (currentTrackSerialized == null || currentTime == null || voiceChannelId == null) {
        return false;
    }

    const client = player.client;
    const voiceChannel = await client.channels.fetch(voiceChannelId);
    if (voiceChannel == null || !voiceChannel.isVoiceBased() || voiceChannel.members.size == 0) {
        return false;
    }

    const guild = await client.guilds.fetch(guildQueueDocument._id);
    const textChannelId = guildQueueDocument.textChannel;
    const textChannel = textChannelId ? await guild.channels.fetch(textChannelId) ?? null : null;
    if (textChannel == null || !textChannel.isTextBased()) {
        return false;
    }

    const nodeOptions = await functions.getNodeOptions(guild.id, {
        channel: textChannel,
        client: guild.members.me,
        requestedBy: (await guild.members.fetch(guildQueueDocument.requested_by)).user
    });
    const queue = player.nodes.create(guild, nodeOptions);
    const currentTrack = Track.fromSerialized(player, currentTrackSerialized);
    await queue.connect(voiceChannelId);
    await queue.play(currentTrack, {
        audioPlayerOptions: {
            seek: currentTime
        },
        nodeOptions
    });
    queue.addTrack(await functions.getSavedTracks(player, guild.id));
    return true;
}

/**
 * 音楽プレイヤーに関わるユーティリティ関数群。
 */
const functions = {

    /**
     * 対話を起こしたメンバーが接続していて、この bot が参加しているか参加できるボイスチャンネルの ID を取得する。
     * @param {import('discord.js').Interaction} interaction 対話オブジェクト
     * @returns メンバーが接続しているボイスチャンネルの ID。この bot が接続できる状態にない場合は null
     */
    getPlayableVoiceChannelId(interaction) {
        const member = interaction.member;
        if (!(member instanceof GuildMember)) {
            return null;
        }
        const memberVC = member.voice.channelId;
        const myVC = interaction?.guild?.members?.me?.voice.channelId;

        if (memberVC != null && (myVC === memberVC || myVC == null))
            return memberVC;
        else
            return null;
    },

    /**
     * 対話が起こったサーバーで再生されている楽曲のキューを取得する。
     * @param {import("discord.js").Interaction} interaction 対話オブジェクト
     * @returns 楽曲を再生している場合、楽曲のキュー。再生していない場合、null
     */
    getPlayingQueue(interaction) {
        const guildId = interaction.guild;
        if (guildId == null) {
            return null;
        }
        const queue = useQueue(guildId);
        if (queue?.isPlaying())
            return queue;

        return null;
    },

    /**
     * トラックの長さを求める。
     * @param {Track<unknown>} track トラック
     * @returns トラックの長さ
     */
    getDuration(track) {
        return new Timespan({ millis: track.durationMS });
    },

    /**
     * サーバーでの音量設定を保存する。
     * @param {string} guildId ギルド ID
     * @param {number} volume 音量
     */
    async saveVolumeSetting(guildId, volume) {
        /** @type {Collection<VolumeSchema>} */
        const volumeCollection = mongodb.connection.collection('volumes');
        await volumeCollection.updateOne(
            { guild: guildId },
            {
                $set: {
                    guild: guildId,
                    volume: volume
                }
            },
            { upsert: true }
        );
    },

    /**
     * サーバーでの音量設定を取得する。
     * @param {string} guildId ギルド ID
     * @returns {Promise<number | undefined>} 音量
     */
    async loadVolumeSetting(guildId) {
        /** @type {Collection<VolumeSchema>} */
        const volumeCollection = mongodb.connection.collection('volumes');
        const result = await volumeCollection.findOne({ guild: guildId });
        if (result != null) {
            return result.volume;
        }
    },

    /**
     * 音楽の再生を開始する。
     * @template [T=unknown]
     * @param {string} guild ギルド ID
     * @param {import('discord.js').GuildVoiceChannelResolvable} channel 再生するボイスチャンネル
     * @param {import('discord-player').TrackLike} query 再生する曲または音源
     * @param {T=} metadata 付加するメタデータ
     */
    async play(guild, channel, query, metadata) {
        const volume = await functions.loadVolumeSetting(guild);
        return await useMainPlayer().play(channel, query, {
            nodeOptions: await functions.getNodeOptions(guild, metadata)
        });
    },

    /**
     * ノードのオプションを取得する。
     * @template [T=unknown]
     * @param {string} guild ギルド
     * @param {T=} metadata 付加するメタデータ
     * @returns {Promise<import('discord-player').GuildNodeCreateOptions<T>>} ノードのオプション
     */
    async getNodeOptions(guild, metadata) {
        const volume = await functions.loadVolumeSetting(guild);
        return {
            metadata,
            bufferingTimeout: 15000,
            leaveOnStop: true,
            leaveOnStopCooldown: 5000,
            leaveOnEnd: true,
            leaveOnEndCooldown: 15000,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 1000, // 300_000 に戻す
            volume
        }
    },

    /**
     * 現在のキューの状態をデータベースに保存する。
     * @param {GuildQueue<QueueMetadata>} queue キュー
     */
    async saveQueue(queue) {
        const guild = queue.guild.id;
        const metadata = queue.metadata;

        /** @type {Collection<GuildQueueSchema>} */
        const guildQueueCollection = mongodb.connection.collection('guild_queues');
        await guildQueueCollection.deleteOne({ _id: guild });
        await guildQueueCollection.insertOne({
            _id: guild,
            voiceChannel: queue.channel?.id ?? null,
            current_track: queue.currentTrack?.serialize() ?? null,
            current_time: queue.node.estimatedPlaybackTime,
            textChannel: metadata.channel?.id ?? null,
            client: metadata.client?.id ?? null,
            requested_by: metadata.requestedBy.id
        });

        /** @type {Collection<GuildQueueTrackSchema>} */
        const guildQueueTrackCollection = mongodb.connection.collection('guild_queue_tracks');
        const tracks = queue.tracks.toArray();
        await guildQueueTrackCollection.deleteMany({ guild });
        await guildQueueTrackCollection.insertMany(tracks.map(
            (track, index) => ({
                guild,
                index,
                track: track.serialize(),
            })
        ));
    },

    /**
     * データベースに保存されたキューを削除する。
     * @param {string[]} guilds ギルド ID
     */
    async deleteSavedQueues(...guilds) {
        /** @type {Collection<GuildQueueSchema>} */
        const guildQueueCollection = mongodb.connection.collection('guild_queues');
        const deletedQueues = await guildQueueCollection.deleteMany({ _id: { $in: guilds } });
        /** @type {Collection<GuildQueueTrackSchema>} */
        const guildQueueTrackCollection = mongodb.connection.collection('guild_queue_tracks');
        const deletedTracks = await guildQueueTrackCollection.deleteMany({ guild: { $in: guilds } });
    },

    /**
     * データベースに保存されたキューの状態を復元する。
     * @param {Player} player プレイヤー
     */
    async restoreQueues(player) {
        /** @type {Collection<GuildQueueSchema>} */
        const guildQueueCollection = mongodb.connection.collection('guild_queues');
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
     * @param {Player} player プレイヤー
     * @param {string} guild ギルド ID
     */
    async getSavedTracks(player, guild) {
        /** @type {Collection<GuildQueueTrackSchema>} */
        const guildQueueTrackCollection = mongodb.connection.collection('guild_queue_tracks');
        const guildQueueTrackDocuments = guildQueueTrackCollection.find({ guild });
        const result = [];
        for await (const { index, track } of guildQueueTrackDocuments) {
            result[index] = Track.fromSerialized(player, track);
        }
        return result;
    }

};

module.exports = functions;
