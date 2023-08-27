const { SlashCommandBuilder } = require('discord.js');
const axios = require("axios");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('サーバーの状態を確認します。')
		.addStringOption(option =>
			option
				.setName('ServerName')
				.setDescription('サーバーを指定します。')
				.setRequired(true) //trueで必須、falseで任意
				.addChoices(
					{name:'メインサーバー', value:'main'},
					{name:'クリエイティブサーバー', value:'creative'},
					{name:'PvPサーバー', value:'pvp'}
				)
		),
	execute: async function(interaction) {
		const target = interaction.options.getString('server')
			if(target == 'main'){
				let res = await axios.get("https://api.mcsv.life/v1/server/status");
				if(res?.data?.status == "online"){
					await interaction.reply('メインサーバーはオンラインです!');
				}else{
					await interaction.reply('接続に失敗しました!');
				}
			}

			if(target == 'creative'){
				let res = await axios.get("https://api2.mcsv.life/v1/server/status");
				if(res?.data?.status == "online"){
					await interaction.reply('クリエイティブサーバーはオンラインです!');
				}else{
					await interaction.reply('接続に失敗しました!');
				}
			}

			if(target == 'pvp'){
				let res = await axios.get("https://api3.mcsv.life/v1/server/status");
				if(res?.data?.status == "online"){
					await interaction.reply('PvPサーバーはオンラインです!');
				}else{
					await interaction.reply('接続に失敗しました!');
				}
			}
		
	},
};