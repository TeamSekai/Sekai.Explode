
module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev01')
        .setDescription('view'),
    execute: async function (interaction) {
        await interaction.reply(`ふぁっきゅー`)
    }
};