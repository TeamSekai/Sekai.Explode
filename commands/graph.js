const { ChartJSNodeCanvas } = require("chartjs-node-canvas")
const { createCanvas, loadImage } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('graph')
		.setDescription('test'),
	execute: async function(interaction) {
		const width = 800;
		const height = 400;

		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext('2d');
    	const configuration = {
			type: 'line',
			data: {
				labels: ['1', '2', '3', '4', '5'],
				datasets: [{
					label: 'かいるん',
					data: [12, 19, 3, 0, 10],
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


