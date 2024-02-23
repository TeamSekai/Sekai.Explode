const { SlashCommandBuilder } = require('discord.js');
const { LANG, strFormat } = require('../util/languages');
const { CheckHostRequest, CHECK_TCP, CheckTcpOk, CheckTcpError, isValidHostname } = require('../util/check-host');
const { formatTable } = require('../util/strings');
module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.checktcp.name)
        .setDescription(LANG.commands.checktcp.description)
        .addStringOption(option => (
            option
                .setName(LANG.commands.checktcp.options.ip.name)
                .setDescription(LANG.common.optionDescription.ipAddress)
                .setRequired(true)
        )),
    execute: async function (interaction) {
        const url = interaction.options.getString(LANG.commands.checktcp.options.ip.name);
        if (!isValidHostname(url)) {
            return await interaction.reply(LANG.commands.checktcp.invalidUrlError);
        }
        const request = await CheckHostRequest.get(CHECK_TCP, url, 40);
        const msg = await interaction.reply(LANG.common.message.checking);
        const resultMap = await request.checkResult();
        const table = [...resultMap.entries()].map(([node, result]) => {
            const nodeName = node.name.replace(".node.check-host.net", "");
            const prefix = `[${nodeName}]`;
            console.log(strFormat(LANG.common.message.dataFor, [nodeName]), result);
            if (result instanceof CheckTcpOk) {
                return [prefix, 'OK,', result.time, '| Ping: ', `${Math.floor(result.time * 1000)} ms`];
            }
            if (result instanceof CheckTcpError) {
                return [prefix, 'ERROR', result.description];
            }
            return [prefix, result.state];
        });
        const str = formatTable(table, {
            align: ['left', 'left', 'left', 'left', 'right']
        });
        msg.edit({
            content: LANG.common.message.result,
            files: [{
                attachment: Buffer.from(str),
                name: "result.txt"
            }]
        });
    }
};