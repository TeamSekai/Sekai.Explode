const { ChartJSNodeCanvas } = require("chartjs-node-canvas")
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('graph')
		.setDescription('グラフを描画します。')
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
		)
		.addBooleanOption(option =>
			option
				.setName('begin_at_zero')
				.setDescription('グラフの最小値を0に固定するか(デフォルト: false)')
				.setRequired(false) // 任意のオプション
		),
	execute: async function(interaction) {

		const nickname = interaction.member.nickname || interaction.user.username;
		let graphtitle = `${nickname}'s graph`
		if (interaction.options.getString('title')) {
			graphtitle = interaction.options.getString('title');
		}

		let label = `value`
		if (interaction.options.getString('label')) {
			label = interaction.options.getString('label');
		}

		let AtZero = false;
		if (interaction.options.getBoolean('begin_at_zero')) {
			AtZero = interaction.options.getBoolean('begin_at_zero')
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
			type: 'line',
			data: {
				labels: values.map((_, index) => `${index + 1}`),
				datasets: [{
					label: label,
					data: data,
					fill: false,
					borderColor: 'rgb(75, 192, 192)',
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
		const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour:"#01010e" });
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


