const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');
const { VoiceChannel } = require('discord.js');
// const ytdl = require('ytdl-core'); さよなら!!!
// const yts = require('yt-search'); 検索機能？要らんやろ



console.log("Loaded play.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play_yt')
        .setDescription('YouTubeの動画/音楽を再生します。Googleが怒ります。')
		.addStringOption(option =>
			option
				.setName("query")
				.setDescription("YouTubeのリンク、または検索したいワード")
				.setRequired(true)
		),
    execute: async function (interaction) {
		const query = interaction.options.get("query").value;
		const member = interaction.member;
		const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
			await interaction.editreply("えー流したくないなぁー...だってVCに実行者が居ないんだもん...")
		}

		await interaction.deferReply();

		const queue = client.player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            }
        });

		// verify vc connection
        try {
            if (!queue.connection) await queue.connect(interaction.member.voice.channel);
        } catch (e) {
            queue.destroy();
            return await interaction.reply(`吐血しちゃった... ${e}`);
        }

		const track = await client.player.search(query, {
            requestedBy: member
        }).then(x => x.tracks[0]);
        if (!track) return await interaction.followUp({ content: `❌ **${query}** が見つかりませんでした!` });

        queue.play(track);

        return await interaction.followUp({ content: `⏱️ **${track.title}**を読み込み中...` });


    }
};