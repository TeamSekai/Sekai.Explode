// Import SlashCommandBuilder from discord.js
const { ChartJSNodeCanvas } = require("chartjs-node-canvas")
const { createCanvas, loadImage } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const fs = require('fs');
const activityModule = require('../activity');
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
		.setName('graph')
		.setDescription('test'),
	execute: async function(interaction) {
		const data = `[${wspingValues}]`
		const width = 800;
		const height = 400;

		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext('2d');
    	const configuration = {
			type: 'line',
			data: {
				labels: data.map((_, index) => index + 1),
				datasets: [{
					label: 'Ping',
					data: data,
					fill: false,
					borderColor: 'rgb(75, 192, 192)',
					tension: 0.1,
				}],
			}
		}
		const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour:"#01010e" });
		const orimoto = await chartJSNodeCanvas.renderToBuffer(configuration);
    	await interaction.reply({
			files: [{
			  attachment: orimoto,
			  name:"chart.png"
			}],
			embeds:[{
			  title: "Chart",
			  image: {
				 "url": "attachment://chart.png"
			  }
			}]
		  })
	},
};



// 引用: https://www.geeklibrary.jp/counter-attack/discord-js-bot/
// module.exportsの補足
// キー・バリューの連想配列のような形で構成されています。
// module.exports = {
//    キー: バリュー,
//    キー: バリュー,
// };