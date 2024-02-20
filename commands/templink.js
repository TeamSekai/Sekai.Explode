const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { LANG, strFormat } = require('../util/languages');
const {
    areTempLinksEnabled,
    createTempLink,
    InvalidURLError
} = require('../internal/templinks');
const { AxiosError } = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.templink.name)
        .setDescription(LANG.commands.templink.description)
        .addStringOption((option) =>
            option
                .setName(LANG.commands.templink.options.url.name)
                .setDescription(LANG.commands.templink.options.url.description)
                .setRequired(true)
        ),
    execute: async function (/** @type {CommandInteraction} */ interaction) {
        if (!areTempLinksEnabled()) {
            return interaction.reply(LANG.commands.templink.internalError);
        }
        let url = interaction.options.get(
            LANG.commands.templink.options.url.name
        ).value;
        try {
            const { id, link } = await createTempLink(url, 1000 * 300);
            console.log(
                strFormat(LANG.commands.templink.linkCreated, { id, url })
            );
            interaction.reply({
                content: null,
                embeds: [
                    {
                        title: LANG.commands.templink.result.title,
                        description: LANG.commands.templink.result.description,
                        fields: [
                            {
                                name: LANG.commands.templink.result.link,
                                value: link
                            }
                        ]
                    }
                ]
            });
        } catch (e) {
            if (e instanceof InvalidURLError) {
                await interaction.reply({
                    content: LANG.commands.templink.invalidUrlError.join('\n'),
                    ephemeral: true
                });
            } else if (e instanceof AxiosError) {
                await interaction.reply({
                    content:
                        strFormat(LANG.commands.templink.httpError, [
                            e.response?.status
                        ]) +
                        '\n' +
                        e.response?.data?.error?.description,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: 'Unknown error',
                    ephemeral: true
                });
            }
        }
    }
};
