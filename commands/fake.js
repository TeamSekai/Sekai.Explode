const { SlashCommandBuilder } = require('discord.js');
const rickurl = "https://paste-pgpj.onrender.com/?p=%3Ciframe%20width=%221280%22%20height=%22720%22%20src=%22https://www.youtube.com/embed/dQw4w9WgXcQ%22%20title=%22Rick%20Astley%20-%20Never%20Gonna%20Give%20You%20Up%20(Official%20Music%20Video)%22%20frameborder=%220%22%20allow=%22accelerometer;%20autoplay;%20clipboard-write;%20encrypted-media;%20gyroscope;%20picture-in-picture;%20web-share%22%20allowfullscreen%3E%3C/iframe%3E"

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('freenitro')
            .setDescription('ニトロをげっちゅ'),
        execute: async function (interaction) {
            await interaction.reply(`[Click to GET](${rickurl})`);
        },
    }, {
        data: new SlashCommandBuilder()
            .setName('adminを乗っ取る')
            .setDescription('管理者権限を奪いましょう'),
        execute: async function (interaction) {
            await interaction.reply(`権限を奪うには[こちらをクリック](${rickurl})`);
        },
    }
];