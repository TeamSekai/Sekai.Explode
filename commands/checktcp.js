const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios').default;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev03')
        .setDescription('Ping Checker')
		.addStringOption(option => (
			option
			.setName('ip')
			.setDescription('IPアドレスを入力')
			.setRequired(true)
		)),
    execute: async function (interaction) {
        let url = interaction.options.getString('ip');
        try { new URL(url) } catch { return interaction.reply("URLが間違っています") };
        let res = await axios.get("https://check-host.net/check-ping", {
            params: {
                host: url,
                max_nodes: 40
            },
            headers: {
                "Accept": "application/json"
            }
        })
        let msg = await interaction.reply("チェックしています...");
        let checkCount = 0;
        let checkResult = async () => {
            checkCount++;
            let res2 = await axios.get("https://check-host.net/check-result/" + res.data.request_id)
            if (checkCount < 8 && (Object.values(res2.data).filter(x => x?.length != 0)).length < (res.data.nodes.length * 0.8)) setTimeout(checkResult, 2000);
            let str = Object.entries(res2.data).map(([key, value]) => {
                let nodeName = key.replace(".node.check-host.net", "");
                let data = value?.[0];
		console.log("Data for", nodeName, ":", data);
                if (!value || !data) return `[${nodeName}] Timeout`;
                return `[${nodeName}] ${data[3] || "Error"}/${data[2]} | Ping: ${Math.floor(data[1] * 1000)}ms`;
            }).filter(x => !!x).join("\n");
            msg.edit({
                content: "結果:",
                files: [{
                    attachment: Buffer.from(str),
                    name: "result.txt"
                }]
            })
        };
        setTimeout(checkResult, 2000);
    }
};