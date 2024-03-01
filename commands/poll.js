const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { LANG } = require("../util/languages");

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.poll.name)
		.setDescription(LANG.commands.poll.description)
		.addStringOption((option) =>
			option
				.setName("title")
				.setDescription(LANG.commands.poll.polltitle)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("choice1")
				.setDescription(LANG.commands.poll.pollchoices)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("choice2")
				.setDescription(LANG.commands.poll.pollchoices)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option.setName("choice3").setDescription(LANG.commands.poll.pollchoices),
		)
		.addStringOption((option) =>
			option.setName("choice4").setDescription(LANG.commands.poll.pollchoices),
		)
		.addStringOption((option) =>
			option.setName("choice5").setDescription(LANG.commands.poll.pollchoices),
		)
		.addStringOption((option) =>
			option.setName("choice6").setDescription(LANG.commands.poll.pollchoices),
		)
		.addStringOption((option) =>
			option.setName("choice7").setDescription(LANG.commands.poll.pollchoices),
		)
		.addStringOption((option) =>
			option.setName("choice8").setDescription(LANG.commands.poll.pollchoices),
		)
		.addStringOption((option) =>
			option.setName("choice9").setDescription(LANG.commands.poll.pollchoices),
		)
		.addStringOption((option) =>
			option.setName("choice10").setDescription(LANG.commands.poll.pollchoices),
		),
	execute: async function (interaction) {
		await interaction.deferReply();
		const { channel } = await interaction;
		const options = await interaction.options.data;
		const emojis = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
		const poll = new EmbedBuilder();
		poll.setColor(0x2aa198);
		for (let i = 1; i < options.length; i++) {
			const emoji = emojis[i - 1];
			const option = options[i];
			poll.addFields({ name: `${emoji} **${option.value}**`, value: " " });
		}
		poll.setTimestamp();
		poll.setFooter({
			text: `Sekai.Explode - (Poll Created by ${interaction.user.displayName})`,
			iconURL:
				"https://github.com/TeamSekai/Sekai.Explode/raw/v14-dev/assets/images/icon.webp",
		});
		const message = await channel.send({ embeds: [poll] });
		for (let i = 1; i < options.length; i++) {
			const emoji = emojis[i - 1];
			await message.react(emoji);
		}
		return await interaction.editReply(`**${options[0].value}**`);
	},
};
