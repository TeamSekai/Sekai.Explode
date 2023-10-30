const { joinVoiceChannel, createAudioResource, createAudioPlayer, generateDependencyReport } = require('@discordjs/voice');
const { createReadStream } = require('fs');
const { join } = require('path');
const Denyguilds = ['1080075319429562480', '826482648264826482648264826482648264']

module.exports = {
	data: new SlashCommandBuilder()
		.setName('おりもと無敵モード')
		.setDescription('でゅあうんｗｗｗｗ'),
	execute: async function(interaction) {
		const member = interaction.member;
		const voiceChannel = member.voice.channel;
		const guild = interaction.guildId
	
	if (Denyguilds.includes(guild)) {
		await interaction.reply('あんた馬鹿ぁ？(このサーバーでは音声を流せません。)');
		return;
	}

	if (!voiceChannel) {
		await interaction.reply("ぽまえvcに居らんから無理やで");
		return;
	}


    const connection = joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: voiceChannel.guild.id,
		adapterCreator: voiceChannel.guild.voiceAdapterCreator,
	  });

	// 音声ファイルのパスを指定
    const audioFilePath = join(__dirname, '../sounds/star.wav');

    // 音声ファイルを読み込み、ストリームとして再生
	const player = createAudioPlayer();
    const audioResource = createAudioResource(createReadStream(audioFilePath));
   	player.play(audioResource);
    connection.subscribe(player);
	await interaction.reply(`> ＊織本かいるはスター状態になった!`);


    // 音声再生が終了したらボイスチャットから退出
    player.on('idle', () => {
      connection.destroy();
    });

	},
}
