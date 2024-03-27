const {
	SlashCommandBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} = require('discord.js');
const { LANG, strFormat } = require('../../../util/languages');
const cooldowns = new Map();

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.dm.name)
		.setDescription(LANG.commands.dm.description)
		.addUserOption((option) =>
			option
				.setName(LANG.commands.dm.options.user.name)
				.setDescription(LANG.commands.dm.options.user.description)
				.setRequired(true),
		),
	/* .addBooleanOption(option =>
			option
				.setName('silent')
				.setDescription('通知を無効にして送るかどうか')
				.setRequired(false) // 任意のオプション
		),
		*/
	execute: async function (interaction) {
		const cooldownTime = 10;

		const executorId = interaction.user.id;
		if (cooldowns.has(executorId)) {
			const expirationTime = cooldowns.get(executorId);
			const currTime = Date.now();

			const remainingTime = Math.ceil((expirationTime - currTime) / 1000);
			if (remainingTime > 0) {
				return interaction.reply(
					strFormat(LANG.commands.dm.cooldown, [remainingTime]),
				);
			}
		}

		const userId = interaction.options.getUser(
			LANG.commands.dm.options.user.name,
		);
		if (userId.bot) {
			return await interaction.reply({
				content: 'Botに対して実行することはできません!',
				ephemeral: true,
			});
		}

		const modal = new ModalBuilder()
			.setCustomId('modaldm')
			.setTitle('DMを送信します...');

		const msgcontent = new TextInputBuilder()
			.setCustomId('content')
			.setLabel('送信したいメッセージ')
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder('送りたいメッセージをここに記入...')
			.setRequired(true)
			.setMaxLength(1024);
		const firstRow = new ActionRowBuilder().addComponents(msgcontent);
		modal.addComponents(firstRow);
		await interaction.showModal(modal);
		// const filter = (mInteraction) => mInteraction.customId === 'gbanreport';
		try {
			const submitted = await interaction
				.awaitModalSubmit({
					time: 60000,
					filter: (i) => i.user.id === interaction.user.id,
				})
				.catch((e) => console.error(e));
			if (submitted) {
				const msg = submitted.fields.getTextInputValue('content');
				const userName = userId.username;
				await submitted.reply(strFormat(LANG.commands.dm.dmSent, [userName]));
				const dmChannel = await userId.createDM();

				dmChannel.send({
					embeds: [
						{
							title: strFormat(LANG.commands.dm.messageTitle, [
								interaction.user.username,
							]),
							thumbnail: {
								url: interaction.user.displayAvatarURL(),
							},
							color: 0x5865f2,
							fields: [
								{
									name: LANG.commands.dm.messageFieldName,
									value: msg,
								},
							],
						},
					],
				});
			}
		} catch (e) {
			console.error(e);
		} finally {
			const expirationTime = Date.now() + cooldownTime * 1000;
			cooldowns.set(executorId, expirationTime);
		}
	},
};
