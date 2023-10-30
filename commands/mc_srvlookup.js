const { SlashCommandBuilder } = require('discord.js');
const dns = require("dns");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcsrv_record')
        .setDescription('Lookup SRV Record')
		.addStringOption(option =>
            option
                .setName("domain")
                .setDescription("ドメインを指定します。")
				.setRequired(true)
        ),
    execute: async function (interaction) {
        let domainName = "_minecraft._tcp." + interaction.options.getString("domain");
		let result = {};
		try {
            dns.resolveSrv(domainName, (err, records) => {
                if (err) {
                    console.error(`Error resolving SRV records for ${domain}: ${err.message}`);
                    interaction.reply(`Error resolving SRV records for ${domain}: ${err.message}`);
                    return;
                }

                if (records.length === 0) {
                    console.log(`No SRV records found for ${domain}`);
                    interaction.reply(`No SRV records found for ${domain}`);
                    return;
                }

                const result = records.map((record, index) => ({
                    priority: record.priority,
                    weight: record.weight,
                    port: record.port,
                    target: record.name,
                }));

                // SRVレコードの結果を表示
                const formattedResult = result.map((record, index) => (
                    `SRV Record #${index + 1}:\n` +
                    `  Priority: ${record.priority}\n` +
                    `  Weight: ${record.weight}\n` +
                    `  Port: ${record.port}\n` +
                    `  Target: ${record.target}\n`
                )).join('\n');

                // interaction.reply(`SRV Records for ${domain}:\n${formattedResult}`);
				interaction.reply({
					embeds: [{
						title: `${domainName}`,
						color: 0xfd75ff,
						footer: {
							text: "ringoXD's Discord.js Bot"
						},
						description: formattedResult
					}]
				})
			});
        } catch (error) {
            console.error(`An error occurred: ${error.message}`);
            await interaction.reply(`An error occurred: ${error.message}`);
        }
    },
};