/*
const { SlashCommandBuilder } = require('@discordjs/builders');
const activityModule = require('../activity');
const wspingValues = activityModule.getPingValues();

console.log('Done')
// いいかんじに
module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev01')
        .setDescription('view'),
    execute: async function (interaction) {
		console.log(wspingValues)
        await interaction.reply(`Result: ${wspingValues}`)
		console.log('Responsed')
    }
};
*/