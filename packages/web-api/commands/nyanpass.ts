import {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	InteractionReplyOptions,
} from 'discord.js';
import { LANG, strFormat } from '../../../util/languages';
import axios from 'axios';
import { Command } from '../../../util/types';

interface NyanpassData {
	time: string;
	count: string;
}

async function getNyanpass() {
	const res = await axios.get<NyanpassData>(
		'https://nyanpass.com/api/get_count',
	);
	return res.data;
}

async function createReply(): Promise<InteractionReplyOptions> {
	const { time, count } = await getNyanpass();
	const embed = new EmbedBuilder()
		.setTitle(LANG.commands.nyanpass.title)
		.setColor(0xe75297)
		.setDescription('```' + count.padStart(15) + '```')
		.setFooter({
			text: strFormat(LANG.commands.nyanpass.footer, [time]),
		});
	const component = new ButtonBuilder()
		.setStyle(ButtonStyle.Link)
		.setEmoji('✋')
		.setLabel(LANG.commands.nyanpass.button)
		.setURL('https://nyanpass.com/');
	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(component);
	return {
		embeds: [embed],
		components: [row],
	};
}

const commandNyanpass: Command = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.nyanpass.name)
		.setDescription(LANG.commands.nyanpass.description),

	async execute(interaction) {
		await interaction.reply(await createReply());
		const interval = setInterval(async () => {
			await interaction.editReply(await createReply());
		}, 3_000);
		setTimeout(() => clearInterval(interval), 60_000);
	},
};

module.exports = commandNyanpass;
