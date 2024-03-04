const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { SlashCommandBuilder } = require('discord.js');
const activityModule = require('../internal/activity');
const { LANG, strFormat } = require('../util/languages');
const wspingValues = activityModule.getPingValues();

// いいかんじに

/*
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check ping'),
	execute: async function(interaction) {
		await interaction.reply(`Pong!(${interaction.client.ws.ping}ms)`);
	},
};
*/

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.ping.name)
		.setDescription(LANG.commands.ping.description),
	execute: async function (interaction) {
		const data = wspingValues
			.slice(-30)
			.concat(new Array(30 - Math.min(30, wspingValues.length)).fill(0))
			.reverse(); // データを取得し、0で補完して逆順に並べ替え
		const width = 800;
		const height = 400;

		const configuration = {
			type: 'line',
			data: {
				labels: data.map((_, index) => index + 1),
				datasets: [
					{
						label: LANG.commands.ping.graphLabel,
						data: data,
						fill: false,
						borderColor: 'rgb(75, 192, 192)',
						tension: 0.1,
					},
				],
			},
			options: {
				scales: {
					y: {
						beginAtZero: true, // 最小値を0に設定
					},
				},
			},
		};
		const chartJSNodeCanvas = new ChartJSNodeCanvas({
			width,
			height,
			backgroundColour: '#01010e',
		});
		const orimoto = await chartJSNodeCanvas.renderToBuffer(configuration);
		await interaction.reply({
			files: [
				{
					attachment: orimoto,
					name: 'chart.png',
				},
			],
			embeds: [
				{
					title: strFormat(LANG.commands.ping.title, [
						interaction.client.ws.ping,
					]),
					image: {
						url: 'attachment://chart.png',
					},
				},
			],
		});
	},
};

// 引用: https://www.geeklibrary.jp/counter-attack/discord-js-bot/
// module.exportsの補足
// キー・バリューの連想配列のような形で構成されています。
// module.exports = {
//    キー: バリュー,
//    キー: バリュー,
// };
