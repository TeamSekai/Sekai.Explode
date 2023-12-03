const { SlashCommandBuilder } = require('discord.js');
const axios = require("axios").default;
const FormData = require("form-data");
const config = require("../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upload')
        .setDescription('ファイルをcdnにアップロード')
        .addAttachmentOption(option =>
            option
                .setName("file")
                .setRequired(true)
                .setDescription("アップロードするファイル"))
        .addStringOption(option =>
            option
                .setName("filename")
                .setDescription("ファイル名")
        )
        .addBooleanOption(option =>
            option
                .setName("private")
                .setDescription("プライベート")
                .setRequired(false)
        ),
    execute: async function (
        /** @type {import('discord.js').CommandInteraction} */
        interaction) {
        if (!config.cdnUploadURL || !config.uploadAllowUsers) {
            return interaction.reply("内部エラー (missing config.json)");
        }
        if (!config.uploadAllowUsers.includes(interaction.user.id)) {
            return interaction.reply({
                content: "ねえ君権限ないよ？ざぁこざぁこ♡www権限ないのに好奇心でコマンド実行しちゃうなんてかわいいね",
                ephemeral: true
            });
        }
        await interaction.deferReply();
        const file = interaction.options.getAttachment("file")

        try {
            let res = await axios.get(file.proxyURL, {
                responseType: "stream"
            });
            const form = new FormData()
            let filename = interaction.options.get("filename")?.value;
            let isPrivate = interaction.options.get("private")?.value == true;
            form.append('file', res.data, filename || file.name)
            let res2 = await axios.post(config.cdnUploadURL, form, {
                params: {
                    private: isPrivate
                },
                headers: form.getHeaders()
            });
			console.log(res)
			console.log("==========")
			console.log(res2)
            interaction.editReply(`/${res2.data.fileName} としてアップロードしました！`);
            const user = interaction.user;
            const dmChannel = await user.createDM();
            dmChannel.send({
                embeds: [{
                    title: `${res2.data.fileName}がアップロードされました!` + (isPrivate ? " (プライベート)" : ""),
                    color: 0x5865f2,
                    fields: [{
                        name: "URL",
                        value: "```" + `https://cdn.mcsv.life/${res2.data.fileName}` + "```" + `\n[Click to copy!](https://paste-pgpj.onrender.com/?p=https://cdn.mcsv.life/${res2.data.fileName})`,
                    }]
                }]
            });
            try {
                if (!config.cfZone || !config.cfToken || !config.cfPurgeUrl) return;
                axios.post(`https://api.cloudflare.com/client/v4/zones/${config.cfZone}/purge_cache`, {
                    files: [config.cfPurgeUrl]
                }, {
                    headers: {
                        Authorization: `Bearer ${config.cfToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            } catch (e) { console.error(e) }
        } catch (e) {
            if (e?.name == "AxiosError" && e?.response?.status) {
                await interaction.editReply({
                    embeds: [{
                        title: "エラー",
                        description: `内部エラー: ${e.response.statusText}(${e.response.status})`,
                        color: 0xff0000,
                        footer: {
                            text: "ringoXD's Discord.js Bot"
                        }
                    }]
                })
            } else {
                throw e;
            }
        }
    },
};
