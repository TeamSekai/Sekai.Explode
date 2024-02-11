const { SlashCommandBuilder } = require('discord.js');
const { getPlayableVoiceChannelId, getPlayingQueue } = require('../util/players');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('音楽を停止します。'),
    execute: async function (interaction) {
        if (getPlayableVoiceChannelId(interaction) == null) 
            return await interaction.reply({ content: 'えー実行したくないなぁー...だってVCに君が居ないんだもん...', ephemeral: true });

        const queue = getPlayingQueue(interaction);
		if (!queue)
			return await interaction.reply({ content: '再生されている曲がありません！', ephemeral: true });

        queue.delete();
        await interaction.reply(`音楽を停止しました👋`)
    }
};
