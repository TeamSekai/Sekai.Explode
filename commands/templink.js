const { SlashCommandBuilder } = require('discord.js');
const { LANG, strFormat } = require('../util/languages');
const {
    areTempLinksEnabled,
    createTempLink,
    InvalidURLError
} = require('../internal/templinks');

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
    execute: async function (interaction) {
        if (!areTempLinksEnabled()) {
            return interaction.reply(LANG.commands.templink.internalError);
        }
        let url = interaction.options.get(
            LANG.commands.templink.options.url.name
        ).value;
        try {
            const { id, link } = createTempLink(url);
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
            await interaction.reply({
                content: LANG.commands.templink.invalidUrlError.join('\n'),
                ephemeral: true
            });
        }
    }
};
