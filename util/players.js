const { useQueue } = require('discord-player');

/**
 * 音楽プレイヤーに関わるユーティリティ関数群。
 */
module.exports = {

    /**
     * 対話を起こしたメンバーが接続していて、この bot が参加しているか参加できるボイスチャンネルの ID を取得する。
     * @param {import('discord.js').Interaction<import('discord.js').CacheType} interaction 対話オブジェクト
     * @returns メンバーが接続しているボイスチャンネルの ID。この bot が接続できる状態にない場合は null
     */
    getPlayableVoiceChannelId(interaction) {
        const /** @type {string | null} */ memberVC = interaction.member.voice.channelId;
        const /** @type {string | null} */ myVC = interaction.guild.members.me.voice.channelId;

        if (memberVC != null && (myVC === memberVC || myVC == null))
            return memberVC;
        else
            return null;
    },

    /**
     * 対話が起こったサーバーで再生されている楽曲のキューを取得する。
     * @param {import("discord.js").Interaction<import("discord.js").CacheType>} interaction 対話オブジェクト
     * @returns 楽曲を再生している場合、楽曲のキュー。再生していない場合、null
     */
    getPlayingQueue(interaction) {
        const queue = useQueue(interaction.guildId);
        if (queue?.isPlaying())
            return queue;

        return null;
    }

};
