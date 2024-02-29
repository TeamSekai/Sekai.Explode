// @ts-check

const assert = require('assert');
const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const { LANG } = require("../util/languages");
const { ClientMessageHandler, ReplyPattern } = require("../internal/messages");
const Pager = require('../util/pager');
const config = require("../config.json");

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
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName(LANG.commands.reply.subcommands.remove.name)
                .setDescription(LANG.commands.reply.subcommands.remove.description)
                .addStringOption(option =>
                    option
                        .setName(LANG.commands.reply.subcommands.remove.options.message.name)
                        .setDescription(LANG.commands.reply.subcommands.remove.options.message.description)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName(LANG.commands.reply.subcommands.list.name)
                .setDescription(LANG.commands.reply.subcommands.list.description)),

    async execute(interaction) {
        const guild = interaction.guild;
        if (guild == null) {
            await interaction.reply(LANG.commands.reply.notInGuildError);
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const clientMessageHandler = ClientMessageHandler.instance;
        assert(clientMessageHandler != null);

        const guildMessageHandler = clientMessageHandler.getGuildMessageHandler(guild.id);

        switch (subcommand) {
            case LANG.commands.reply.subcommands.add.name: {
                if (!await checkPermission(interaction)) {
                    return;
                }
                const replyPattern = new ReplyPattern(
                    interaction.options.getString(LANG.commands.reply.subcommands.add.options.message.name, true),
                    interaction.options.getString(LANG.commands.reply.subcommands.add.options.reply.name, true),
                    interaction.options.getBoolean(LANG.commands.reply.subcommands.add.options.perfectMatching.name, false) ?? false
                );
                const success = await guildMessageHandler.addReplyPattern(replyPattern);
                if (success) {
                    await interaction.reply(LANG.commands.reply.subcommands.add.succeeded + '\n' + replyPattern);
                } else {
                    await interaction.reply({
                        content: LANG.commands.reply.subcommands.add.alreadyExists,
                        ephemeral: true,
                    });
                }
                return;
            }

            case LANG.commands.reply.subcommands.remove.name: {
                if (!checkPermission(interaction)) {
                    return;
                }
                const replyPattern = await guildMessageHandler.removeReplyPattern(
                    interaction.options.getString(LANG.commands.reply.subcommands.remove.options.message.name, true)
                );
                if (replyPattern != null) {
                    await interaction.reply(LANG.commands.reply.subcommands.remove.succeeded + '\n' + replyPattern);
                } else {
                    await interaction.reply({
                        content: LANG.commands.reply.subcommands.remove.doNotExist,
                        ephemeral: true,
                    });
                }
                return;
            }

            case LANG.commands.reply.subcommands.list.name: {
                const replyPatterns = await guildMessageHandler.getReplyPatterns();
                const pager = new Pager(replyPatterns.map(pattern => `- ${pattern}`), {
                    title: '自動応答メッセージ',
                    color: 'Green',
                    emptyMessage: 'メッセージが設定されていません'
                });
                await pager.replyTo(interaction);
                return;
            }

            default:
                assert.fail(subcommand);
        }
    }
};

/**
 * 使う権限があるかをチェックする。
 * @param {ChatInputCommandInteraction} interaction
 */
async function checkPermission(interaction) {
    if (!config.replyEditionAllowedUsers?.includes(interaction.user.id)) {
        await interaction.reply({
            content: LANG.commands.reply.permissionError,
            ephemeral: true,
        });
        return false;
    }
    return true;
}

module.exports = commandReply;
