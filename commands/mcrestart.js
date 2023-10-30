const { SlashCommandBuilder } = require('discord.js');
const AdminuserIDs = ['1063527758292070591', '1126422758696427552'];


// いいかんじに
module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('サーバーを再起動します.')
        .addStringOption(option => (
            option
                .setName('target')
                .setDescription('再起動するサーバーを選択')
                .setRequired(true)
                .addChoices({name:"メインサーバー",value:"main"})
                .addChoices({name:"クリエイティブサーバー",value:"creative"})
                .addChoices({name:"PvPサーバー",value:"pvp"})
        )),
    execute: async function (interaction) {
		if (!AdminuserIDs.includes(interaction.user.id)) {
			await interaction.reply('このコマンドはBotの管理者のみ使えます。');
			return;
		}
        const target = interaction.options.getString('target');

		if (target === 'main') {
			await interaction.reply(`Selected ${target}.`);
			return;
		}
		if (target === 'creative') {
			await interaction.reply(`Selected ${target}.`);
			return;
		}
		if (target === 'pvp') {
			await interaction.reply(`Selected ${target}.`);
			return;
		} else {
			await interaction.reply(`\<a:alert:1167793917199122462> 無効なオプションを検知しました。`);
			return;
		}
    }
};