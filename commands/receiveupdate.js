const assert = require('assert');
const {
	SlashCommandBuilder,
	ChannelType,
	PermissionsBitField,
	NewsChannel,
} = require('discord.js');
const { LANG, strFormat } = require('../util/languages');

module.exports = {
	data: new SlashCommandBuilder()
		//TODO: i18n
		.setName(LANG.commands.receiveupdate.name)
		.setDescription(LANG.commands.receiveupdate.description)
		.addChannelOption((option) =>
			option
				.setName(LANG.commands.receiveupdate.options.channel.name)
				.setDescription(LANG.commands.receiveupdate.options.channel.description)
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true),
		),
	execute: async function (
		/** @type {CommandInteraction} */ interaction,
		/** @type {Client} */ client,
	) {
		await interaction.deferReply();
		if (
			!interaction.member.permissions.has(
				PermissionsBitField.Flags.Administrator,
			)
		) {
			return await interaction.editReply(
				LANG.commands.receiveupdate.permissionError,
			);
		}
		const targetchannel = interaction.options.getChannel(
			LANG.commands.receiveupdate.options.channel.name,
		);

		const channel = client.channels.resolve('1211695901760819281'); //TODO: config.jsonで編集可能に?
		assert(channel instanceof NewsChannel);
		try {
			await channel.addFollower(targetchannel.id);
			const { name, id } = interaction.guild;
			console.log(
				strFormat(LANG.commands.receiveupdate.followerAddedLog, { name, id }),
			);
			await interaction.editReply(
				strFormat(
					LANG.commands.receiveupdate.followerAddedMessage,
					`<#${targetchannel.id}>`,
				),
			);
		} catch (e) {
			console.log(strFormat(LANG.commands.receiveupdate.errorOccurredLog, [e]));
			await interaction.editReply(
				strFormat(LANG.commands.receiveupdate.errorOccurredMessage, [e]),
			);
		}
	},
};
