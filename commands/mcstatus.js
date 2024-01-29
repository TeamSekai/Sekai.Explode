const { SlashCommandBuilder } = require('discord.js');
const axios = require("axios");


module.exports = {
	data: new SlashCommandBuilder()
		.setName("mcstatus")
		.setDescription("サーバーの状態を確認します。")
		.addStringOption(option =>
			option
				.setName("server_ip")
				.setDescription("サーバーを指定します。")
				.setRequired(true) //trueで必須、falseで任意
		)
		.addBooleanOption(option =>
			option
				.setName('bedrock_server')
				.setDescription('統合版サーバーかどうか')
				.setRequired(false) // 任意のオプション
		),
	execute: async function (/** @type {import("discord.js").CommandInteraction} */ interaction) {
		let server = interaction.options.getString("server_ip");
		let isbedrock = interaction.options.getBoolean("bedrock_server")
		await interaction.deferReply();
		try {
//			let target_server = server_ip
			if (server) {
				let res = await axios.get("https://api.mcsrvstat.us/" + (isbedrock ? "bedrock/" : "") + "3/" + server);
				if (res.data?.online) {
					let motd = res.data.motd.raw.join("\n")
						.replace(/\u00A70/g, "\x1B[30m")
						.replace(/\u00A71/g, "\x1B[34m")
						.replace(/\u00A72/g, "\x1B[32m")
						.replace(/\u00A73/g, "\x1B[36m")
						.replace(/\u00A74/g, "\x1B[31m")
						.replace(/\u00A75/g, "\x1B[35m")
						.replace(/\u00A76/g, "\x1B[33m")
						.replace(/\u00A77/g, "\x1B[37m")
						.replace(/\u00A78/g, "\x1B[90m")
						.replace(/\u00A79/g, "\x1B[94m")
						.replace(/\u00A7a/g, "\x1B[92m")
						.replace(/\u00A7b/g, "\x1B[96m")
						.replace(/\u00A7c/g, "\x1B[91m")
						.replace(/\u00A7d/g, "\x1B[95m")
						.replace(/\u00A7e/g, "\x1B[93m")
						.replace(/\u00A7f/g, "\x1B[97m")
						.replace(/\u00A7k/g, "\x1B[6m")
						.replace(/\u00A7l/g, "\x1B[1m")
						.replace(/\u00A7m/g, "\x1B[9m")
						.replace(/\u00A7n/g, "\x1B[4m")
						.replace(/\u00A7o/g, "\x1B[3m")
						.replace(/\u00A7r/g, "\x1B[0m");
					if (motd.length == 0)
						motd = "オンライン";
					await interaction.editReply({
						embeds: [{
							"title": `${server}は**オンライン**です!`,
							"description": "```ansi\n" + motd + "\n```",
							color: 0x42d4f5,
							fields: [{
								name: "人数",
								value: `${res.data.players.online} / ${res.data.players.max}`
							}, {
								name: "バージョン",
								value: res.data.version
							}],
							...(res.data.icon && {
								thumbnail: { url: "https://api.mcsrvstat.us/icon/" + server }
							})
						}]
					});
				} else {
					await interaction.editReply(`${server}はオフラインです`);
				}
				return;
			}
			let res = await axios.get(server.url);
			if (res?.data?.status == "online") {
				await interaction.editReply(`${server}は ** オンライン ** です!`);
			} else {
				await interaction.editReply("接続に失敗しました!");
			}
		} catch (e) {
			if (e?.name == "AxiosError" && e?.response?.status) {
				await interaction.editReply({
					embeds: [{
						title: "エラー",
						description: `内部エラー: ${e.response.statusText}(${e.response.status})`,
						color: 0xff0000,
						footer: {
							text: "Sekai.Explode"
						}
					}]
				})
			} else {
				throw e;
			}
		}
	}
};