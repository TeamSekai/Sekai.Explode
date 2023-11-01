const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

console.log("Loaded stop.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('音楽を停止します。'),
    execute: async function (interaction) {
        const queue = useQueue(interaction.guildId);

        const member = interaction.member;
        const channel = member.voice.channel;

        if (!channel) {
            await interaction.reply("えー実行したくないなぁー...だってVCに君が居ないんだもん...")
			return;
        }

		const queuedTracks = queue.tracks.toArray();
    	if (!queuedTracks[0])
    	  return interaction.reply({ content: `再生されている曲がありません！`, ephemeral: true });

        queue.delete();
        await interaction.reply(`音楽を停止しました👋`)
    }
};