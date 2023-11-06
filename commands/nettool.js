const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('net_tool')
        .setDescription('ネットワーク関連のコマンド')
		.addSubcommand(subcommand =>
			subcommand
				.setName('isproxy')
				.setDescription('check IP address using ip-api.com')
				.addStringOption(option =>
					option
						.setName("ip")
						.setDescription("Target IP")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('ipinfo')
				.setDescription('IPInfo Lookup')
				.addStringOption(option =>
					option
						.setName("ip")
						.setDescription("IPアドレスを指定します。")
						.setRequired(true)
				),
		),
		
    execute: async function (interaction) {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'isproxy') {
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
		
		if (subcommand === 'ipinfo') {
			await interaction.deferReply();
        	let ip = interaction.options.getString("ip");
        	try {
        	    let data = (await axios.get(`https://ipinfo.io/${encodeURI(ip)}/json`)).data;
				console.log(`Target: ${encodeURI(ip)}`)
				console.log(`Status: ${data.status}`)
        	    if (data?.status == "404" || data?.bogon == true) {
        	        throw new Error("IPアドレスが間違っています");
        	    }
				console.log(data.hostname)
				console.log(data.country)
				console.log(data.city)
				console.log(data.region)
				console.log(data.org)
        	    await interaction.editReply({
        	        embeds: [{
        	            title: `${ip}'s IPInfo`,
        	            color: 0xfd75ff,
        	            footer: {
        	                text: "ringoXD's Discord.js Bot"
        	            },
        	            fields: [{
							name: "Target",
							value: interaction.options.getString("ip")
						}, {
        	                name: "Country",
        	                value: data.country
        	            }, {
        	                name: "City",
        	                value: data.city
        	            }, {
        	                name: "Region",
        	                value: data.region
        	            }, {
        	                name: "org",
        	                value: data.org
        	            }]
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
	}
}