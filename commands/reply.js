// @ts-check

const { SlashCommandBuilder } = require("discord.js");
const { LANG } = require("../util/languages");

/** @type {import("../util/types").Command} */
const commandReply = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.reply.name)
        .setDescription(LANG.commands.reply.description)
        .addSubcommand(subcommand =>
            subcommand
                .setName(LANG.commands.reply.subcommands.add.name)
                .setDescription(LANG.commands.reply.subcommands.add.description)
                .addStringOption(option =>
                    option
                        .setName(LANG.commands.reply.subcommands.add.options.message.name)
                        .setDescription(LANG.commands.reply.subcommands.add.options.message.description)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName(LANG.commands.reply.subcommands.add.options.reply.name)
                        .setDescription(LANG.commands.reply.subcommands.add.options.reply.description)
                        .setRequired(true))
                .addBooleanOption(option =>
                    option
                        .setName(LANG.commands.reply.subcommands.add.options.perfectMatching.name)
                        .setDescription(LANG.commands.reply.subcommands.add.options.perfectMatching.description)
                        .setRequired(false))
                .addBooleanOption(option =>
                    option
                        .setName(LANG.commands.reply.subcommands.add.options.regularExpression.name)
                        .setDescription(LANG.commands.reply.subcommands.add.options.regularExpression.description)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName(LANG.commands.reply.subcommands.remove.name)
                .setDescription(LANG.commands.reply.subcommands.remove.description)
                .addStringOption(option =>
                    option
                        .setName(LANG.commands.reply.subcommands.remove.name)
                        .setDescription(LANG.commands.reply.subcommands.remove.description)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName(LANG.commands.reply.subcommands.list.name)
                .setDescription(LANG.commands.reply.subcommands.list.description)),

    async execute(interaction) {
        interaction.reply('This command is in developing!');
    }
};

module.exports = commandReply;
