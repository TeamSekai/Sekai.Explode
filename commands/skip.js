const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

console.log("Loaded skip.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('音楽をスキップします！'),
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

		const queuedTracks = queue.tracks.toArray();
    	if (!queuedTracks[0])
    	  return interaction.reply({ content: `キューに曲がありません！`, ephemeral: true });

        try {
			queue.node.skip()
        	await interaction.reply({
				embeds: [{
					title: `**${queue.currentTrack.title}**をスキップしました!`,
					thumbnail: {
						url: queue.currentTrack.thumbnail
					},
					color: 0x5865f2,
				}]
			})
		} catch (e) {
			interaction.reply(`はぁ？処理の実行中にエラー(${e})が発生してるんだけど？\nコードもまともに書けないなんてどうしようもないクズね...`)
		}
    }
};