const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('idk')
        .setDescription('shitcord code test'),
    execute: async function (interaction) {
		/** @type {import("discord.js").CommandInteraction} */
        const usr = interaction.user.id
		const member = await interaction.guild.members.fetch(usr)
		const roles = member.roles.cache
		const sortedRoles = roles.sort((a, b) => b.position - a.position);
		const topRole = sortedRoles.first();
		await interaction.reply(`Result: ${topRole}`)
    }
};