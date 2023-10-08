const { SlashCommandBuilder } = require('@discordjs/builders');
const { linkDomain } = require("../config.json");

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
        .setName('templink')
        .setDescription('一時リンクを生成します')
        .addStringOption(option =>
            option
                .setName("url")
                .setDescription("リンク先")
                .setRequired(true)
        ),
    execute: async function (interaction) {
        if (!interaction.client.templinks) {
            return interaction.reply("内部エラー");
        }
        let url = interaction.options.get("url").value;
        try {
            new URL(url);
        } catch {
            await interaction.reply({
                content: "URLが間違っています。\nhttps:// までを含めたURLを入力してください",
                ephemeral: true
            });
            return;
        }
        let id = makeid(5);
        console.log(`[TempLink] リンク: ${id} が生成されました リンク先: ${url}`)
        interaction.client.templinks.push({
            id: id,
            url: url,
            createdAt: new Date(),
            period: 1000 * 10
        });
        interaction.reply({
            content: null,
            embeds: [{
                title: `https://${linkDomain}/${id}`
            }]
        })
    }
};