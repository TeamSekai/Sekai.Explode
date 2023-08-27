// Import SlashCommandBuilder from discord.js
const { SlashCommandBuilder } = require('discord.js');
const os = require("os");

// いいかんじに
module.exports = {
    data: new SlashCommandBuilder()
        .setName('version')
        .setDescription('てすと'),
    execute: async function (interaction) {
        await interaction.reply("Running in Node.女子小学生(js) " + process.version + " | " + os.version);
    }
};