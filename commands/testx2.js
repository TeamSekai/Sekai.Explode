const { SlashCommandBuilder } = require('discord.js');
const { LANG, strFormat } = require('../util/languages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.testx2.name)
        .setDescription(LANG.commands.testx2.description),
    execute: async function (interaction) {
		/** @type {import("discord.js").CommandInteraction} */
        const usr = interaction.user.id
		const member = await interaction.guild.members.fetch(usr)
		const roles = member.roles.cache
		const sortedRoles = roles.sort((a, b) => b.position - a.position);
		const topRole = sortedRoles.first();
		await interaction.reply(strFormat(LANG.commands.testx2.message, [topRole.name]));
    }
};