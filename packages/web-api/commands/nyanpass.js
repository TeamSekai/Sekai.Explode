// @ts-check

const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} = require('discord.js');
const { LANG, strFormat } = require('../../../util/languages');
const axios = require('axios').default;

/**
 * @typedef {Object} NyanpassData
 * @property {string} time
 * @property {string} count
 */

async function getNyanpass() {
	/** @type {import('axios').AxiosResponse<NyanpassData>} */
	const res = await axios.get('https://nyanpass.com/api/get_count');
	return res.data;
}

/**
 *
 * @returns {Promise<import('discord.js').InteractionReplyOptions>}
 */
async function createReply() {
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
	/** @type {ActionRowBuilder<ButtonBuilder>} */
	const row = new ActionRowBuilder();
	row.addComponents(component);
	return {
		embeds: [embed],
		components: [row],
	};
}

/** @type {import("../../../util/types").Command} */
const commandNyanpass = {
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
