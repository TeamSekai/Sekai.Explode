const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { VoiceChannel } = require('discord.js');
const { useMainPlayer } = require('discord-player');
// const ytdl = require('ytdl-core'); さよなら!!!
// const yts = require('yt-search'); 検索機能？要らんやろ
//


console.log("Loaded play.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('音楽を再生します!')
		.addStringOption(option =>
			option
				.setName("query")
				.setDescription("YouTubeやSoundCloudのリンク、または検索したいワード")
				.setRequired(true)
		),
    execute: async function (interaction) {
		const player = useMainPlayer();
		const query = interaction.options.get("query").value;
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

		await interaction.deferReply();

		try {
			const searchResult = await player.search(query, { requestedBy: interaction.user, searchEngine: QueryType.AUTO });

    		if (!searchResult || searchResult.tracks.length == 0 || !searchResult.tracks) {
    		  return interaction.followUp('うわーん！曲が見つからなかったよぉ...');
    		}
    		const res = await player.play(interaction.member.voice.channel.id, searchResult, {
    		  nodeOptions: {
    		    metadata: {
    		      channel: interaction.channel,
    		      client: interaction.guild.members.me,
    		      requestedBy: interaction.user,
    		    },
    		    bufferingTimeout: 15000,
    		    leaveOnStop: true,
    		    leaveOnStopCooldown: 5000,
    		    leaveOnEnd: true,
    		    leaveOnEndCooldown: 15000,
    		    leaveOnEmpty: true,
    		    leaveOnEmptyCooldown: 300000,
    		    skipOnNoStream: true,
    		  },
    		});

			return interaction.followUp({
				embeds: [{
					title: `**${track.title}**をキューに追加しました!`,
					thumbnail: {
						url: track.thumbnail
					},
					color: 0x5865f2,
				}]
			})
		} catch (e) {
			// let's return error if something failed
			console.error(e);
			return interaction.followUp(`ばーか! ${e}`);
		}


    }
};