const { SlashCommandBuilder } = require('discord.js');
const dns = require("dns");
const { LANG, strFormat } = require('../util/languages');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.mcSrvlookup.name)
        .setDescription(LANG.commands.mcSrvlookup.description)
		.addStringOption(option =>
            option
                .setName(LANG.commands.mcSrvlookup.options.domain.name)
                .setDescription(LANG.commands.mcSrvlookup.options.domain.description)
				.setRequired(true)
        ),
    execute: async function (interaction) {
        const domain = interaction.options.getString(LANG.commands.mcSrvlookup.options.domain.name);
        const domainName = "_minecraft._tcp." + domain;
		try {
            dns.resolveSrv(domainName, (err, records) => {
                if (err) {
                    console.error(strFormat(LANG.commands.mcSrvlookup.resolutionError, { domain, message: err.message }));
                    interaction.reply(strFormat(LANG.commands.mcSrvlookup.resolutionError, { domain, message: err.message }));
                    return;
                }

                if (records.length === 0) {
                    console.log(strFormat(LANG.commands.mcSrvlookup.notFoundError, [domain]));
                    interaction.reply(strFormat(LANG.commands.mcSrvlookup.notFoundError, [domain]));
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
                    strFormat(LANG.commands.mcSrvlookup.result.title, [index + 1]) + '\n  ' +
                    strFormat(LANG.commands.mcSrvlookup.result.priority, [record.priority]) + '\n  ' +
                    strFormat(LANG.commands.mcSrvlookup.result.weight, [record.weight]) + '\n  ' +
                    strFormat(LANG.commands.mcSrvlookup.result.port, [record.port]) + '\n  ' +
                    strFormat(LANG.commands.mcSrvlookup.result.target, [record.target]) + '\n'
                )).join('\n');

                // interaction.reply(`SRV Records for ${domain}:\n${formattedResult}`);
				interaction.reply({
					embeds: [{
						title: `${domainName}`,
						color: 0xfd75ff,
						footer: {
							text: LANG.commands.mcSrvlookup.serviceProvider
						},
						description: formattedResult
					}]
				})
			});
        } catch (error) {
            console.error(strFormat(LANG.commands.mcSrvlookup.generalError, [error.message]));
            await interaction.reply(strFormat(LANG.commands.mcSrvlookup.generalError, [error.message]));
        }
    },
};