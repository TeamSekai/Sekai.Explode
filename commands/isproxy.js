const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('isproxy')
        .setDescription('check IP address using ip-api.com'),
    execute: async function (interaction) {
		let IP = interaction.options.getString("IP");
		try {
			ipInfo = (await axios.get(`http://ip-api.com/json/${encodeURI(ip)}?fields=status,country,regionName,city,isp,proxy,hosting,vpn`)).data;
		} catch (e) {
			interaction.reply(`ねぇなんでなんでなんでなんでエラー出るの(error: ${e.message})`)
		}
		if (ipInfo.proxy || ipInfo.hosting || ipInfo.vpn) {
			interaction.reply({
				embeds: [{
					title: "ねぇ、このIP怪しいよ",
					description: `This IP issuspicious...`,
					thumbnail: {
						url: `https://cdn.discordapp.com/attachments/1126424081630249002/1160444437453881344/unknown.jpg`
					},
					color: 0xf2930d,
					fields: [{
						name: "IP",
						value: IP,
						inline: true
					}, {
						name: "Country",
						value: ipInfo.country,
						inline: true
					}, {
						name: "ISP",
						value: ipInfo.isp,
						inline: true
					}]
				}]
			})
		}
    }
};