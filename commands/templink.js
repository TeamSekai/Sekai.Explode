const { SlashCommandBuilder } = require('discord.js');
const { linkDomain } = require("../config.json");
const { LANG, strFormat } = require('../util/languages');

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.templink.name)
        .setDescription(LANG.commands.templink.description)
        .addStringOption(option =>
            option
                .setName(LANG.commands.templink.options.url.name)
                .setDescription(LANG.commands.templink.options.url.description)
                .setRequired(true)
        ),
    execute: async function (interaction) {
        if (!interaction.client.templinks) {
            return interaction.reply(LANG.commands.templink.internalError);
        }
        let url = interaction.options.get(LANG.commands.templink.options.url.name).value;
        try {
            new URL(url);
        } catch {
            await interaction.reply({
                content: LANG.commands.templink.invalidUrlError.join('\n'),
                ephemeral: true
            });
            return;
        }
        let id = makeid(5);
        console.log(strFormat(LANG.commands.templink.linkCreated, { id, url }));
        interaction.client.templinks.push({
            id: id,
            url: url,
            createdAt: new Date(),
            period: 1000 * 300
        });
        interaction.reply({
            content: null,
            embeds: [{
                title: LANG.commands.templink.result.title,
				description: LANG.commands.templink.result.description,
				fields: [{
					name: LANG.commands.templink.result.link,
					value: `https://${linkDomain}/${id}`
				}]
            }]
        })
    }
};