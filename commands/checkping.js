const { SlashCommandBuilder, CommandInteraction } = require("discord.js");
const { LANG, strFormat } = require("../util/languages");
const {
	CheckHostRequest,
	CHECK_PING,
	CheckPingOk,
	isValidHostname,
} = require("../util/check-host");
const { formatTable } = require("../util/strings");

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.checkping.name)
		.setDescription(LANG.commands.checkping.description)
		.addStringOption((option) =>
			option
				.setName(LANG.commands.checkping.options.ip.name)
				.setDescription(LANG.common.optionDescription.ipAddress)
				.setRequired(true),
		),
	execute: async function (/** @type {CommandInteraction} */ interaction) {
		let url = interaction.options.getString(
			LANG.commands.checkping.options.ip.name,
		);
		if (!isValidHostname(url)) {
			// IPアドレスが間違っています。(IPv4、またはドメインのみ対応しています。
			return await interaction.reply(LANG.commands.checkping.invalidIpError);
		}
		const request = await CheckHostRequest.get(CHECK_PING, url, 40);
		const msg = await interaction.reply(LANG.common.message.checking);
		const resultMap = await request.checkResult(1.0, 7);
		const table = [...resultMap.entries()].map(([node, result]) => {
			const nodeName = node.name.replace(".node.check-host.net", "");
			const prefix = `[${nodeName}]`;
			console.log(strFormat(LANG.common.message.dataFor, [nodeName]), result);
			if (result instanceof CheckPingOk) {
				const values = result.values;
				const average =
					values.reduce((a, { ping: b }) => a + b, 0) / values.length;
				return [
					prefix,
					values[3].reply + ",",
					values[3].ping,
					"/",
					values[2].reply + ",",
					values[2].ping,
					"| Ping:",
					`${Math.floor(average * 1000)} ms`,
				];
			}
			return [prefix, result.state];
		});
		const str = formatTable(table, {
			align: ["left", "left", "left", "left", "left", "left", "left", "right"],
		});
		msg.edit({
			content: LANG.common.message.result,
			files: [
				{
					attachment: Buffer.from(str),
					name: "result.txt",
				},
			],
		});
	},
};
