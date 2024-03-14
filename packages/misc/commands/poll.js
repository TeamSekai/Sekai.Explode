// @ts-check

const { EmbedBuilder } = require('discord.js');
const { LANG, strFormat } = require('../../../util/languages');
const { SimpleSlashCommandBuilder } = require('../../../common/SimpleCommand');

module.exports = SimpleSlashCommandBuilder.create(
	LANG.commands.poll.name,
	LANG.commands.poll.description,
)
	.addStringOption({
		name: LANG.commands.poll.options.title.name,
		description: LANG.commands.poll.polltitle,
		required: true,
	})
	.addStringOption({
		name: strFormat(LANG.commands.poll.options.choice$.name, 1),
		description: LANG.commands.poll.pollchoices,
		required: true,
	})
	.addStringOption({
		name: strFormat(LANG.commands.poll.options.choice$.name, 2),
		description: LANG.commands.poll.pollchoices,
		required: true,
	})
	.addStringOption({
		name: strFormat(LANG.commands.poll.options.choice$.name, 3),
		description: LANG.commands.poll.pollchoices,
		required: false,
	})
	.addStringOption({
		name: strFormat(LANG.commands.poll.options.choice$.name, 4),
		description: LANG.commands.poll.pollchoices,
		required: false,
	})
	.addStringOption({
		name: strFormat(LANG.commands.poll.options.choice$.name, 5),
		description: LANG.commands.poll.pollchoices,
		required: false,
	})
	.addStringOption({
		name: strFormat(LANG.commands.poll.options.choice$.name, 6),
		description: LANG.commands.poll.pollchoices,
		required: false,
	})
	.addStringOption({
		name: strFormat(LANG.commands.poll.options.choice$.name, 7),
		description: LANG.commands.poll.pollchoices,
		required: false,
	})
	.addStringOption({
		name: strFormat(LANG.commands.poll.options.choice$.name, 8),
		description: LANG.commands.poll.pollchoices,
		required: false,
	})
	.addStringOption({
		name: strFormat(LANG.commands.poll.options.choice$.name, 9),
		description: LANG.commands.poll.pollchoices,
		required: false,
	})
	.addStringOption({
		name: strFormat(LANG.commands.poll.options.choice$.name, 10),
		description: LANG.commands.poll.pollchoices,
		required: false,
	})
	.build(async function (interaction, title, ...choices) {
		await interaction.deferReply();
		const { channel } = await interaction;
		if (channel == null) {
			return;
		}

		const filteredChoices = choices.filter((x) => x != null);
		const emojis = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
		const poll = new EmbedBuilder();
		poll.setColor(0x2aa198);
		for (const [i, choice] of filteredChoices.entries()) {
			const emoji = emojis[i];
			poll.addFields({ name: `${emoji} **${choice}**`, value: ' ' });
		}
		poll.setTimestamp();
		poll.setFooter({
			text: strFormat(LANG.commands.poll.footer, [
				interaction.user.displayName,
			]),
			iconURL:
				'https://github.com/TeamSekai/Sekai.Explode/raw/v14-dev/assets/images/icon.webp',
		});
		const message = await channel.send({ embeds: [poll] });
		for (const i of filteredChoices.keys()) {
			const emoji = emojis[i];
			await message.react(emoji);
		}
		await interaction.editReply(`**${title}**`);
	});
