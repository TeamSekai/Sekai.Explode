const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unicode')
        .setDescription('unicode変換ツール')
		.addStringOption(option => (
			option
			.setName('mode')
			.setDescription('モード選択')
			.setRequired(true)
			.addChoices({name:"テキスト -> Unicode",value:"encode"})
			.addChoices({name:"Unicode -> テキスト",value:"decode"})
		))
		.addStringOption(option => (
			option
			.setName('text')
			.setDescription('変換したい文字列を入力')
			.setRequired(true)
		)),
    execute: async function (interaction) {
        const mode = interaction.options.getString('mode');
        const text = interaction.options.getString('text');

        if (mode === 'encode') {
            const unicodeArray = Array.from(text).map(char => char.charCodeAt(0));
            const unicodeString = unicodeArray.map(code => `\\u${code.toString(16).padStart(4, '0')}`).join('');
            await interaction.reply({
				embeds: [{
					title: "テキストをエンコードしました!",
					fields: [{
						name: "結果:",
						value: "```\n" + unicodeString + "\n```"
					}]
				}]
			});
        } else if (mode === 'decode') {
            const unicodeString = text.replace(/\\u[\dA-Fa-f]{4}/g, match => String.fromCharCode(parseInt(match.slice(2), 16)));
			await interaction.reply({
				embeds: [{
					title: "テキストをデコードしました!",
					fields: [{
						name: "結果:",
						value: "```\n" + unicodeString + "\n```"
					}]
				}]
			});
        }
    }
};