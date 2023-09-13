const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('throw_error')
        .setDescription('わざとエラーを吐かせます'),
    execute: async function (interaction) {
		if (!interaction.member.permissions.has("ADMINISTRATOR"))
        	await interaction.reply({
        	    ephemeral: true,
        	    content: "権限がありません"
        	})
        else {
			await interaction.reply("Success!");
			throw new Error("node.js error test by ringoXD")
		}
    }
};