const { SlashCommandBuilder } = require('discord.js');
const { LANG } = require('../util/languages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('soon')
		.addStringOption(option=>option.setName('title').setDescription('Pollのタイトル').setRequired(true))
		.addStringOption(option=>option.setName('choice1').setDescription('選択肢を入力...').setRequired(true))
		.addStringOption(option=>option.setName('choice2').setDescription('選択肢を入力...').setRequired(true))
		.addStringOption(option=>option.setName('choice3').setDescription('選択肢を入力...'))
		.addStringOption(option=>option.setName('choice4').setDescription('選択肢を入力...'))
		.addStringOption(option=>option.setName('choice5').setDescription('選択肢を入力...'))
		.addStringOption(option=>option.setName('choice6').setDescription('選択肢を入力...'))
		.addStringOption(option=>option.setName('choice7').setDescription('選択肢を入力...'))
		.addStringOption(option=>option.setName('choice8').setDescription('選択肢を入力...'))
		.addStringOption(option=>option.setName('choice9').setDescription('選択肢を入力...'))
		.addStringOption(option=>option.setName('choice10').setDescription('選択肢を入力...')),
	execute: async function (interaction) {
		await interaction.deferReply();
		const { channel } = await interaction;
		const options = await interaction.options.data();
		await interaction.editReply('soon')
		// await interaction.reply(LANG.commands.poll.message)
	}
};