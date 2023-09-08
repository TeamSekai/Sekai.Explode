// Import SlashCommandBuilder from discord.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChartJSNodeCanvas } = require("chartjs-node-canvas")

// いいかんじに
module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('じっけんちゅー'),
	execute: async function(interaction) {
		await interaction.reply('はろーわーるど');
	},
};

// 引用: https://www.geeklibrary.jp/counter-attack/discord-js-bot/
// module.exportsの補足
// キー・バリューの連想配列のような形で構成されています。
// module.exports = {
//    キー: バリュー,
//    キー: バリュー,
// };