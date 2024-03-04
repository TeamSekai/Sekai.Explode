const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios').default;
const FormData = require('form-data');
const config = require('../config.json');
const { LANG, strFormat } = require('../util/languages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.upload.name)
		.setDescription(LANG.commands.upload.description)
		.addAttachmentOption((option) =>
			option
				.setName(LANG.commands.upload.options.file.name)
				.setRequired(true)
				.setDescription(LANG.commands.upload.options.file.description),
		)
		.addStringOption((option) =>
			option
				.setName(LANG.commands.upload.options.filename.name)
				.setDescription(LANG.commands.upload.options.filename.description),
		)
		.addBooleanOption((option) =>
			option
				.setName(LANG.commands.upload.options.private.name)
				.setDescription(LANG.commands.upload.options.private.description)
				.setRequired(false),
		),
	execute: async function (
		/** @type {import('discord.js').CommandInteraction} */
		interaction,
	) {
		if (!config.cdnUploadURL || !config.uploadAllowUsers) {
			return interaction.reply(LANG.commands.upload.internalError);
		}
		if (!config.uploadAllowUsers.includes(interaction.user.id)) {
			return interaction.reply({
				content: LANG.commands.upload.permissionError,
				ephemeral: true,
			});
		}
		await interaction.deferReply();
		const file = interaction.options.getAttachment(
			LANG.commands.upload.options.file.name,
		);

		try {
			const res = await axios.get(file.proxyURL, {
				responseType: 'stream',
			});
			const form = new FormData();
			const filename = interaction.options.get(
				LANG.commands.upload.options.filename.name,
			)?.value;
			const isPrivate =
				interaction.options.get(LANG.commands.upload.options.private.name)
					?.value == true;
			console.log(strFormat(LANG.commands.upload.isPrivateLog, [isPrivate]));
			form.append('file', res.data, filename || file.name);
			const res2 = await axios.post(config.cdnUploadURL, form, {
				params: {
					private: isPrivate,
				},
				headers: form.getHeaders(),
			});
			// console.log(res)
			// console.log("==========")
			// console.log(res2)
			const cdnURL =
				config.cdnRootURL + (isPrivate ? 'private/' : '') + res2.data.fileName;
			interaction.editReply(LANG.commands.upload.fileUploaded + '\n' + cdnURL);
			const user = interaction.user;
			const dmChannel = await user.createDM();
			dmChannel.send({
				embeds: [
					{
						title: strFormat(LANG.commands.upload.result.title, {
							filename: res2.data.fileName,
							isPrivate: isPrivate
								? LANG.commands.upload.result.isPrivate.yes
								: LANG.commands.upload.result.isPrivate.no,
						}),
						color: 0x5865f2,
						fields: [
							{
								name: LANG.commands.upload.result.url,
								value:
									'```' +
									cdnURL +
									'```' +
									`\n[${LANG.commands.upload.result.clickToCopy}](https://paste-pgpj.onrender.com/?p=` +
									encodeURIComponent(cdnURL) +
									')',
							},
						],
					},
				],
			});
			try {
				if (!config.cfZone || !config.cfToken || !config.cfPurgeUrl) return;
				axios.post(
					`https://api.cloudflare.com/client/v4/zones/${config.cfZone}/purge_cache`,
					{
						files: [config.cfPurgeUrl],
					},
					{
						headers: {
							Authorization: `Bearer ${config.cfToken}`,
							'Content-Type': 'application/json',
						},
					},
				);
			} catch (e) {
				console.error(e);
			}
		} catch (e) {
			if (e?.name == 'AxiosError' && e?.response?.status) {
				await interaction.editReply({
					embeds: [
						{
							title: LANG.commands.upload.errorResult.title,
							description: strFormat(
								LANG.commands.upload.errorResult.description,
								{
									statusText: e.response.statusText,
									status: e.response.status,
								},
							),
							color: 0xff0000,
							footer: {
								text: LANG.commands.upload.errorResult.footer,
							},
						},
					],
				});
			} else {
				throw e;
			}
		}
	},
};
