//const { ChartJSNodeCanvas } = require("chartjs-node-canvas")
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
				labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
				datasets: [{
					label: 'Sales',
					data: [12, 19, 3, 5, 2],
					fill: false,
					borderColor: 'rgb(75, 192, 192)',
					tension: 0.1,
				}],
			}
		}
    	await interaction.reply({
			files: [{
			  attachment: orimoto_kairu_img,
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


