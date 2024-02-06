const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('音量を調節します。')
		.addIntegerOption(option =>
			option
				.setName("volume")
				.setDescription("音量を設定(1~100)")
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(100)
		),
    execute: async function (interaction) {
        const queue = useQueue(interaction.guildId);
		const vol = interaction.options.getInteger("volume");

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


		try {
			queue.node.setVolume(vol)
			interaction.reply(`音量を**${vol}**に設定しました!`)
		} catch (e) {
			interaction.reply('うわーん！吐血しちゃったよぉ...\n' + '```ansi\n' + "\x1b[31m" + e + '\n```');
			console.error(e);
		}
    }
};