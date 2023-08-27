const { SlashCommandBuilder } = require('discord.js');
const axios = require("axios");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('サーバーの状態を確認します。')
		.addStringOption(option =>
			option
				.setName('サーバー')
				.setDescription('サーバーを指定します。')
				.setRequired(true) //trueで必須、falseで任意
				.addChoices(
					{name:'メインサーバー', value:'main'},
					{name:'クリエイティブサーバー', value:'creative'},
					{name:'PvPサーバー', value:'pvp'}
				)
		),
	execute: async function(interaction) {
		let res = await axios.get("https://api.mcsv.life/v1/server/status");

		if(res?.data?.status == "online"){
			await interaction.reply('メインサーバーはオンラインです!');
		}else{
			await interaction.reply('接続に失敗しました!');
		}
		
	},
};