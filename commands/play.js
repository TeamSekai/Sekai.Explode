const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
// const yts = require('yt-search'); 検索機能？要らんやろ

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('YouTubeの動画/音楽を再生します。Googleが怒ります。')
		.addStringOption(option =>
			option
				.setName("url")
				.setDescription("YouTubeのリンク")
				.setRequired(true)
		),
    execute: async function (interaction) {
		const url = interaction.options.get("url").value;
		const member = interaction.member;
		const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
			await interaction.reply("えー流したくないなぁー...だってVCに実行者が居ないんだもん...")
		}
		if (yrdl.validateURL(url)) {
			player(url, voiceChannel)
			await interaction.reply(`${url} を再生ちゅー`)
		}

    }
};

const player = async (url, voiceChannel) => {
	const channel = voiceChannel.id
	const connection = await channel.join();
	const stream = ytdl(ytdl.getURLVideoID(url), { filter: 'audioonly' });
	const dispatcher = connection.play(stream, { volume: 0.1, bitrate: 256 });
	dispatcher.once('finish', () => {
	  channel.leave();
	});
  };