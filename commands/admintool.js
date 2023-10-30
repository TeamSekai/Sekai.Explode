module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev02')
        .setDescription('view'),
    execute: async function (interaction) {
        await interaction.reply(`ふぁっきゅー`)
    }
};