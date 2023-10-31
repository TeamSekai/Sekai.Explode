const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

console.log("Loaded play.js")
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('音楽を停止します。'),
    execute: async function (interaction) {
        const queue = useQueue(interaction.guildId);

        const member = interaction.member;
        const channel = member.voice.channel;

        if (!channel) {
            await interaction.reply("えー流したくないなぁー...だってVCに実行者が居ないんだもん...")
        }

        queue.delete();
        await interaction.reply(`音楽を停止しました👋`)
    }
};