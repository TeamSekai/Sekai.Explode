const { SlashCommandBuilder } = require('discord.js');
const { ChartJSNodeCanvas } = require("chartjs-node-canvas")
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const { LANG, strFormat } = require('../util/languages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.pieChart.name)
		.setDescription(LANG.commands.pieChart.description)
		.addStringOption(option =>
			option
				.setName(LANG.commands.pieChart.options.values.name)
				.setDescription(LANG.common.optionDescription.graphValues)
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName(LANG.commands.pieChart.options.label.name)
				.setDescription(strFormat(LANG.common.optionDescription.graphLabel, [LANG.common.defaultValues.graphLabel]))
				.setRequired(false)
		)
		.addStringOption(option =>
			option
				.setName(LANG.commands.pieChart.options.title.name)
				.setDescription(strFormat(LANG.common.optionDescription.graphTitle, [
					strFormat(LANG.commands.pieChart.defaultTitle, [LANG.common.optionDescription.userPlaceholder])]))
				.setRequired(false)
		),
	execute: async function(interaction) {


		let linergb = 'rgb(75, 192, 192)'

		let bgtheme = "#b0cdff"

		const nickname = interaction.member.nickname || interaction.user.username;
		let graphtitle = strFormat(LANG.commands.pieChart.defaultTitle, [nickname]);
		if (interaction.options.getString(LANG.commands.pieChart.options.title.name)) {
			graphtitle = interaction.options.getString(LANG.commands.pieChart.options.title.name);
		}

		let label = LANG.common.defaultValues.graphLabel;
		if (interaction.options.getString(LANG.commands.pieChart.options.label.name)) {
			label = interaction.options.getString(LANG.commands.pieChart.options.label.name);
		}

		const valuesString = interaction.options.getString(LANG.commands.pieChart.options.values.name);
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
						'rgb(75, 192, 192)',
						'rgb(153, 102, 255)',
						'rgb(255, 159, 64)',
						'rgb(255, 120, 120)',
						'rgb(120, 255, 120)',
						'rgb(120, 120, 255)',
						'rgb(255, 255, 102)',
                        // add other
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


