const dns = require("dns");
const axios = require("axios").default;
const ipRangeCheck = require("ip-range-check");
let cfIps = [];
axios.get("https://www.cloudflare.com/ips-v4").catch(() => { console.log("CloudflareのIPリストの取得に失敗しました") }).then((res) => {
    cfIps = res.data.split("\n");
});
const dnsTypes = [
    "A", "AAAA", "NS", "CNAME", "TXT", "MX", "SRV"
]
module.exports = {
    data: new SlashCommandBuilder()
        .setName('nslookup')
        .setDescription('DNS Lookup!')
        .addStringOption(option =>
            option
                .setName("domain")
                .setDescription("ドメインを指定します。")
				.setRequired(true)
        ),
    execute: async function (interaction) {
        await interaction.deferReply();
        let domainName = interaction.options.getString("domain");
        try {
            let dnsResult = {};

            await Promise.all(dnsTypes.map(async (type) => {
                try {
                    let res = await dns.promises.resolve(domainName, type);
                    if (res.length > 0) {
                        if (type == "MX") {
                            res = res.sort((a, b) => b.priority - a.priority)
                            dnsResult[type] = "```\n" + res.map(x => {
                                return `- ${x.exchange} (優先度:${x.priority})`
                            }).join("\n") + "\n```";
                            return;
                        }
                        dnsResult[type] = "```\n" + res.map(x => {
                            let isCf = ipRangeCheck(x, cfIps);
                            return `- ${x}${isCf ? " (CloudFlare)" : ""}`
                        }).join("\n") + "\n```";
                    }
                } catch (e) {
                    if (e.code == "ENOTFOUND") {
                        throw new Error("ドメインが存在しません");
                    }
                }
            }));

            let fields = dnsTypes.map(x => {
                if (dnsResult[x]) {
                    return {
                        name: x,
                        value: dnsResult[x]
                    }
                }
            }).filter(x => !!x);

            await interaction.editReply({
                embeds: [{
                    title: `${domainName}`,
                    color: 0xfd75ff,
                    footer: {
                        text: "ringoXD's Discord.js Bot"
                    },
                    fields
                }],
            })
        } catch (e) {
            await interaction.editReply({
                embeds: [{
                    title: "エラー",
                    description: `${e.message}`,
                    color: 0xff0000,
                    footer: {
                        text: "ringoXD's Discord.js Bot"
                    }
                }]
            })
        }
    }
};