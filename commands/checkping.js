const { SlashCommandBuilder } = require('discord.js');
const { LANG, strFormat } = require('../util/languages');
const axios = require('axios').default;

const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.checkping.name)
        .setDescription(LANG.commands.checkping.description)
		.addStringOption(option => (
			option
			.setName(LANG.commands.checkping.options.ip.name)
			.setDescription(LANG.common.optionDescription.ipAddress)
			.setRequired(true)
		)),
	execute: async function (interaction) {
		let url = interaction.options.getString(LANG.commands.checkping.options.ip.name);
		if (!ipv4Regex.test(url)) {
			try {
				new URL(url)
			} catch {
				return interaction.reply(LANG.commands.checkping.invalidIpError);
			}
			// return interaction.reply("IPアドレスが間違っています。(IPv4、またはドメインのみ対応しています。");
		}
		let res = await axios.get("https://check-host.net/check-ping", {
			params: {
				host: url,
				max_nodes: 40
			},
			headers: {
				"Accept": "application/json"
			}
		})
		let msg = await interaction.reply(LANG.common.message.checking);
		let checkCount = 0;
		let checkResult = async () => {
			checkCount++;
			let res2 = await axios.get("https://check-host.net/check-result/" + res.data.request_id)
			if (checkCount < 8 && (Object.values(res2.data).filter(x => x?.length != 0)).length < (res.data.nodes.length * 0.8)) setTimeout(checkResult, 2000);
			let str = Object.entries(res2.data).map(([key, value]) => {
				let nodeName = key.replace(".node.check-host.net", "");
				let data = value?.[0];
		console.log(strFormat(LANG.common.message.dataFor, [nodeName]), data);
				if (!value || !data) return `[${nodeName}] Timeout`;
				return `[${nodeName}] ${data[3] || "Error"}/${data[2]} | Ping: ${Math.floor(data[1] * 1000)}ms`;
			}).filter(x => !!x).join("\n");
			msg.edit({
				content: LANG.common.message.result,
				files: [{
					attachment: Buffer.from(str),
					name: "result.txt"
				}]
			})
		};
		setTimeout(checkResult, 2000);
	}
};