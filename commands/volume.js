const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { LANG, strFormat } = require('../util/languages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.volume.name)
        .setDescription(LANG.commands.volume.description)
		.addIntegerOption(option =>
			option
				.setName(LANG.commands.volume.options.volume.name)
				.setDescription(LANG.commands.volume.options.volume.description)
				.setRequired(true)
				.setMinValue(0)
				.setMaxValue(100)
		),
    execute: async function (interaction) {
        const queue = useQueue(interaction.guildId);
		const vol = interaction.options.getInteger(LANG.commands.volume.options.volume.name);

        const member = interaction.member;
        const channel = member.voice.channel;

        if (!channel) {
            return await interaction.reply({ content: LANG.common.message.notPlayableError, ephemeral: true });
        }

		if (
			interaction.guild.members.me.voice.channelId &&
			interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId
		)
			return await interaction.reply({ content: LANG.common.message.notPlayableError, ephemeral: true });

    	if (!queue || !queue.isPlaying())
    	  return interaction.reply({ content: LANG.common.message.noTracksPlayed, ephemeral: true });


		try {
			queue.node.setVolume(vol)
			interaction.reply(strFormat(LANG.commands.volume.volumeSet, ['**' + vol + '**']));
		} catch (e) {
			interaction.reply(LANG.commands.volume.error + '\n' + '```ansi\n' + "\x1b[31m" + e + '\n```');
			console.error(e);
		}
    }
};