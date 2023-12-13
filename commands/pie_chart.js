/*
const { SlashCommandBuilder } = require('discord.js');
const { ChartJSNodeCanvas } = require("chartjs-node-canvas")
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('piechart')
		.setDescription('円グラフを生成します。')
		.addStringOption(option =>
			option
				.setName("values")
				.setDescription("値を入力(それぞれの値は1, 2, 3のようにコンマで区切ること。)")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("label")
				.setDescription("値のラベル(例: 個数) (未入力の場合はvalueとなります)")
				.setRequired(false)
		)
		.addStringOption(option =>
			option
				.setName('title')
				.setDescription(`タイトルを入力(未入力の場合はuser's graphとなります`)
				.setRequired(false)
		),
	execute: async function(interaction) {


		let linergb = 'rgb(75, 192, 192)'

		let bgtheme = "#b0cdff"

		const nickname = interaction.member.nickname || interaction.user.username;
		let graphtitle = `${nickname}'s pie chart`
		if (interaction.options.getString('title')) {
			graphtitle = interaction.options.getString('title');
		}

		let label = `value`
		if (interaction.options.getString('label')) {
			label = interaction.options.getString('label');
		}

		const valuesString = interaction.options.getString('values');
		console.log(valuesString)
		const values = valuesString.split(',').map(val => parseInt(val.trim()));
		console.log(values)

		const width = 800;
		const height = 400;

		const data = values
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext('2d');
    	const configuration = {
			type: 'doughnut',
			data: {
				labels: values.map((_, index) => `${index + 1}`),
				datasets: [{
					label: label,
					data: data,
					backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 205, 86)',
                        'rgb(54, 162, 235)',
                        // 他の色も必要に応じて追加
                    ],
				}],
			},
		}
		const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour:bgtheme });
		const orimoto = await chartJSNodeCanvas.renderToBuffer(configuration);
    	await interaction.reply({
			files: [{
			  attachment: orimoto,
			  name:"chart.png"
			}],
			embeds:[{
			  title: graphtitle,
			  image: {
				 "url": "attachment://chart.png"
			  }
			}]
		})
	},
};


*/