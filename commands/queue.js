const { SlashCommandBuilder } = require('discord.js');
const Pager = require('../util/pager');
const { getPlayableVoiceChannelId, getPlayingQueue } = require('../util/players');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('キュー一覧を確認します。'),
    execute: async function (interaction) {
        if (getPlayableVoiceChannelId(interaction) == null)
            return await interaction.reply({ content: 'えー実行したくないなぁー...だってVCに君が居ないんだもん...', ephemeral: true });

        const queue = getPlayingQueue(interaction);
        if (!queue)
            return await interaction.reply({ content: `再生されている曲がありません！`, ephemeral: true });

        const queuedTracks = queue.tracks.toArray();
        const tracks = queuedTracks.map((track, idx) => `**${idx + 1})** [${track.title}](${track.url})`);

        const chunkSize = 10;

        const pager = new Pager(tracks, {
            pageLength: chunkSize,
            color: 'Red',
            title: `${queue.tracks.size}件の曲がキューに入っています!`,
            emptyMessage: '**キューに曲がありません！**',
            footer: pager => ({  // 丸括弧を付けないとブロックとして解釈されてしまうという罠
                text: `${pager.page + 1}ページ目 | ${queue.tracks.size}曲`
            })
        })
        pager.replyTo(interaction);
    },
};