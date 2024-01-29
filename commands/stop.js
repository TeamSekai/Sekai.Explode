const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('音楽を停止します。'),
    execute: async function (interaction) {
        const queue = useQueue(interaction.guildId);

        const member = interaction.member;
        const channel = member.voice.channel;

        if (!channel) {
            return await interaction.reply({ content: 'えー実行したくないなぁー...だってVCに君が居ないんだもん...', ephemeral: true });
        }

		if (
			interaction.guild.members.me.voice.channelId &&
			interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId
		)
			return await interaction.reply({ content: 'えー実行したくないなぁー...だってVCに君が居ないんだもん...', ephemeral: true });

		if (!queue || !queue.isPlaying())
			return interaction.reply({ content: `再生されている曲がありません！`, ephemeral: true });

        queue.delete();
        await interaction.reply(`音楽を停止しました👋`)
    }
};