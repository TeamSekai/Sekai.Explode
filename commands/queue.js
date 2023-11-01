const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

console.log("Loaded queue.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('キュー一覧を確認します。'),
    execute: async function (interaction) {
        const queue = useQueue(interaction.guildId);

    if (!interaction.member.voice.channelId)
      return await interaction.reply({ content: 'えー実行したくないなぁー...だってVCに君が居ないんだもん...', ephemeral: true });
    if (
      interaction.guild.members.me.voice.channelId &&
      interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId
    )
      return await interaction.reply({ content: 'えー実行したくないなぁー...だってVCに君が居ないんだもん...', ephemeral: true });

    const queuedTracks = queue.tracks.toArray();
    if (!queuedTracks[0])
		return interaction.reply({ content: `再生されている曲がありません！`, ephemeral: true });

    const tracks = queuedTracks.map((track, idx) => `**${idx + 1})** [${track.title}](${track.url})`);

    const chunkSize = 10;
    const pages = Math.ceil(tracks.length / chunkSize);

    let currentPage = 0;

    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('キュー一覧')
      .setDescription(
        tracks.slice(currentPage * chunkSize, (currentPage + 1) * chunkSize).join('\n') || '**キューに曲がありません！**',
      )
      .setFooter({
        text: `${currentPage + 1}ページ目 | ${queue.tracks.size}曲`,
      });

    if (pages === 1) {
      return interaction.reply({
        embeds: [embed],
      });
    }

    const prevButton = new ButtonBuilder()
      .setCustomId('prev')
      .setLabel('前のページ')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('⬅️');

    const nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('次のページ')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('➡️');

    const row = new ActionRowBuilder().addComponents(prevButton, nextButton);

    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      idle: 60000,
    });

    collector.on('collect', i => {
      i.deferUpdate();

      switch (i.customId) {
        case 'prev':
          currentPage = currentPage === 0 ? pages - 1 : currentPage - 1;
          break;
        case 'next':
          currentPage = currentPage === pages - 1 ? 0 : currentPage + 1;
          break;
        default:
          break;
      }

      embed
        .setDescription(
          tracks.slice(currentPage * chunkSize, (currentPage + 1) * chunkSize).join('\n') || '**キューに曲がありません！**',
        )
        .setFooter({
          text: `${currentPage + 1}ページ目 | ${queue.tracks.size}曲`,
        });

      message.edit({
        embeds: [embed],
        components: [row],
      });
    });

    collector.on('end', () => {
      message.edit({
        components: [],
      });
    });
  },
};