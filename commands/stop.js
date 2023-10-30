const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
// const ytdl = require('ytdl-core'); さよなら!!!
// const yts = require('yt-search'); 検索機能？要らんやろ
//


console.log("Loaded play.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('音楽を停止します。'),
    execute: async function (interaction) {
		const player = useMainPlayer();
		const member = interaction.member;
		const channel = member.voice.channel;
		const queue = player.queues(interaction.guildId);

		if (!queue) {
			await interaction.reply("音楽が再生されていません!")
		}

        if (!channel) {
			await interaction.reply("えー流したくないなぁー...だってVCに実行者が居ないんだもん...")
		}

		player.destroy();
		await interaction.reply(`音楽を停止しました👋`)


    }
};