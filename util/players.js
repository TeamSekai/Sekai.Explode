// @ts-check

const { useQueue, Track } = require('discord-player');
const Timespan = require('./timespan');
const mongodb = require('../internal/mongodb');
const { GuildMember } = require('discord.js');

/**
 * 音楽プレイヤーに関わるユーティリティ関数群。
 */
module.exports = {

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
        const volumeCollection = mongodb.connection.collection('volumes');
        const result = await volumeCollection.findOne({ guild: guildId });
        if (result != null) {
            return result.volume;
        }
    }

};
