const { SlashCommandBuilder } = require('discord.js');
const { ChartJSNodeCanvas } = require("chartjs-node-canvas")
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const { LANG, strFormat } = require('../util/languages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.graph.name)
		.setDescription(LANG.commands.graph.description)
		.addStringOption(option =>
			option
				.setName(LANG.commands.graph.options.values.name)
				.setDescription(LANG.common.optionDescription.graphValues)
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName(LANG.commands.graph.options.label.name)
				.setDescription(strFormat(LANG.common.optionDescription.graphLabel, [LANG.common.defaultValues.graphLabel]))
				.setRequired(false)
		)
		.addStringOption(option =>
			option
				.setName(LANG.commands.graph.options.title.name)
				.setDescription(strFormat(LANG.common.optionDescription.graphTitle, [
					strFormat(LANG.commands.graph.defaultTitle, [LANG.common.optionDescription.userPlaceholder])]))
				.setRequired(false)
		)
		.addStringOption(option => (
			option
				.setName('line_color')
				.setDescription(LANG.commands.graph.options.lineColor.name)
				.setRequired(false)
				.addChoices({name:LANG.commands.graph.options.lineColor.choices.red,value:'rgb(255, 0, 0)'})
				.addChoices({name:LANG.commands.graph.options.lineColor.choices.green,value:'rgb(0, 255, 0)'})
				.addChoices({name:LANG.commands.graph.options.lineColor.choices.pink,value:'rgb(255, 0, 255)'})
				.addChoices({name:LANG.commands.graph.options.lineColor.choices.white,value:'rgb(255, 255, 255)'})
				.addChoices({name:LANG.commands.graph.options.lineColor.choices.black,value:'rgb(0, 0, 0)'})
				.addChoices({name:LANG.commands.graph.options.lineColor.choices.orange,value:'rgb(255, 128, 0)'})
		))
		.addStringOption(option => (
			option
				.setName(LANG.commands.graph.options.backgroundTheme.name)
				.setDescription(LANG.commands.graph.options.backgroundTheme.description)
				.setRequired(false)
				.addChoices({name:LANG.commands.graph.options.backgroundTheme.choices.dark,value:"#01010e"})
				.addChoices({name:LANG.commands.graph.options.backgroundTheme.choices.light,value:"#F3F3F6"})
		))
		.addBooleanOption(option =>
			option
				.setName(LANG.commands.graph.options.beginAtZero.name)
				.setDescription(LANG.commands.graph.options.beginAtZero.description)
				.setRequired(false) // 任意のオプション
		),
	execute: async function(interaction) {


		let linergb = 'rgb(75, 192, 192)'
		if (interaction.options.getString(LANG.commands.graph.options.lineColor.name)) {
			linergb = interaction.options.getString(LANG.commands.graph.options.lineColor.name);
		}

		let bgtheme = "#01010e"
		if (interaction.options.getString(LANG.commands.graph.options.backgroundTheme.name)) {
			bgtheme = interaction.options.getString(LANG.commands.graph.options.backgroundTheme.name);
		}

		const nickname = interaction.member.nickname || interaction.user.username;
		let graphtitle = strFormat(LANG.commands.graph.defaultTitle, [nickname]);
		if (interaction.options.getString(LANG.commands.graph.options.title.name)) {
			graphtitle = interaction.options.getString(LANG.commands.graph.options.title.name);
		}

		let label = LANG.commands.graph.defaultTitle;
		if (interaction.options.getString(LANG.commands.graph.options.label.name)) {
			label = interaction.options.getString(LANG.commands.graph.options.label.name);
		}

		let AtZero = false;
		if (interaction.options.getBoolean(LANG.commands.graph.options.beginAtZero.name)) {
			AtZero = interaction.options.getBoolean(LANG.commands.graph.options.beginAtZero.name);
		}

		const valuesString = interaction.options.getString(LANG.commands.graph.options.values.name);
		console.log(valuesString)
		const values = valuesString.split(',').map(val => parseInt(val.trim()));
		console.log(values)

		const width = 800;
		const height = 400;

		const data = values
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext('2d');
    	const configuration = {
			type: 'line',
			data: {
				labels: values.map((_, index) => `${index + 1}`),
				datasets: [{
					label: label,
					data: data,
					fill: false,
					borderColor: linergb,
					tension: 0.1,
				}],
			},
			options: {
				scales: {
					y: {
						beginAtZero: AtZero, // 最小値を0に設定
					},
				},
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


