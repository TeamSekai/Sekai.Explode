const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('isproxy')
        .setDescription('check IP address using ip-api.com')
		.addStringOption(option =>
            option
                .setName("ip")
                .setDescription("Target IP")
				.setRequired(true)
        ),
    execute: async function (interaction) {
		let ip = interaction.options.getString("ip");
		try {
			ipInfo = (await axios.get(`http://ip-api.com/json/${encodeURI(ip)}?fields=status,country,regionName,city,isp,proxy,hosting`)).data;
		} catch (e) {
			interaction.reply(`ねぇなんでなんでなんでなんでエラー出るの(error: ${e.message})`)
			return;
		}
		console.log(ipInfo.proxy)
		console.log(ipInfo.hosting)
		if (ipInfo.proxy || ipInfo.hosting) {
			return interaction.reply({
				embeds: [{
					title: "ねぇ、このIP怪しいよ",
					description: `${ip}はproxy、またはhostingのIPです!`,
					thumbnail: {
						url: `https://cdn.discordapp.com/attachments/1126424081630249002/1160444437453881344/unknown.jpg`
					},
					color: 0xf2930d,
					fields: [{
						name: "Country",
						value: ipInfo.country,
						inline: true
					}, {
						name: "ISP",
						value: ipInfo.isp,
						inline: true
					}, {
						name: "isProxy/Hosting",
						value: `isProxy? -> ${ipInfo.proxy}\n` + `isHosting? -> ${ipInfo.hosting}`,
						inline: true
					}]
				}]
			})
		}
		await interaction.reply(`${ip}は安全なIPです`)
    }
};