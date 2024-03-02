const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { LANG, strFormat } = require('../util/languages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.discordinfo.name)
		.setDescription(LANG.commands.discordinfo.description)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(LANG.commands.discordinfo.subcommands.user.name)
				.setDescription(LANG.commands.discordinfo.subcommands.user.description)
				.addUserOption((option) =>
					option
						.setName(
							LANG.commands.discordinfo.subcommands.user.options.target.name,
						)
						.setDescription(
							LANG.commands.discordinfo.subcommands.user.options.target
								.description,
						)
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(LANG.commands.discordinfo.subcommands.server.name)
				.setDescription(
					LANG.commands.discordinfo.subcommands.server.description,
				),
		),
	execute: async function (interaction) {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === LANG.commands.discordinfo.subcommands.user.name) {
			const user = interaction.options.getUser(
				LANG.commands.discordinfo.subcommands.user.options.target.name,
			);
			const member = await interaction.guild.members.fetch(user.id);
			const username = user.username;
			const userid = user.id;
			const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`; //*ChatGPT MOMENT
			const joinDate = `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`;
			const roles = member.roles.cache
				.filter((role) => role.id !== interaction.guild.roles.everyone.id)
				.map((role) => role.name)
				.join(', ');

			const roleCount = member.roles.cache.filter(
				(role) => role.id !== interaction.guild.roles.everyone.id,
			).size; //*ChatGPT again
			const copyLink = `[Copy](https://paste-pgpj.onrender.com/?p=${userid})`;
			await interaction.reply({
				embeds: [
					{
						title: strFormat(LANG.commands.discordinfo.subcommands.user.title, [
							username,
						]),
						thumbnail: {
							url: user.displayAvatarURL({ dynamic: true }),
						},
						color: 0x77e4a6,
						fields: [
							{
								name: LANG.commands.discordinfo.subcommands.user.userId,
								value: strFormat(
									LANG.commands.discordinfo.subcommands.user.userIdValue,
									{ userid, copyLink },
								),
							},
							{
								name: LANG.commands.discordinfo.subcommands.user.createdAt,
								value: createdAt,
								inline: true,
							},
							{
								name: LANG.commands.discordinfo.subcommands.user.joinDate,
								value: joinDate,
								inline: true,
							},
							{
								name: strFormat(
									LANG.commands.discordinfo.subcommands.user.roles,
									[roleCount],
								),
								value: roles,
							},
						],
					},
				],
			});
		}
		if (subcommand === LANG.commands.discordinfo.subcommands.server.name) {
			const guild = interaction.guild;
			const guildname = guild.name;
			const gmembers = guild.memberCount;
			const gchannels = guild.channels.cache.size;
			const gvoicechannels = guild.channels.cache.filter(
				(channel) => channel.type === ChannelType.GuildVoice,
			).size;
			const groles = guild.roles.cache.size;
			const boostStatus =
				guild.premiumSubscriptionCount > 0
					? strFormat(
							LANG.commands.discordinfo.subcommands.server.boostedValue.yes,
							[guild.premiumSubscriptionCount],
						)
					: LANG.commands.discordinfo.subcommands.server.boostedValue.no;
			const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;
			let guildIcon = guild.iconURL({ dynamic: true });
			if (!guildIcon) {
				guildIcon = 'https://cdn.mcsv.life/boticon.webp';
			}

			await interaction.reply({
				embeds: [
					{
						title: strFormat(
							LANG.commands.discordinfo.subcommands.server.title,
							[guildname],
						),
						thumbnail: {
							url: guildIcon,
						},
						color: 0x52c9e0,
						fields: [
							{
								name: LANG.commands.discordinfo.subcommands.server.memberCount,
								value: gmembers,
								inline: true,
							},
							{
								name: LANG.commands.discordinfo.subcommands.server.createdAt,
								value: createdAt,
								inline: true,
							},
							{
								name: LANG.commands.discordinfo.subcommands.server.channelCount,
								value:
									strFormat(
										LANG.commands.discordinfo.subcommands.server
											.textChannelCount,
										[gchannels],
									) +
									'\n' +
									strFormat(
										LANG.commands.discordinfo.subcommands.server
											.voiceChannelCount,
										[gvoicechannels],
									),
							},
							{
								name: LANG.commands.discordinfo.subcommands.server.roleCount,
								value: groles,
							},
							{
								name: LANG.commands.discordinfo.subcommands.server.boosted,
								value: boostStatus,
							},
						],
					},
				],
			});
		}
	},
};
