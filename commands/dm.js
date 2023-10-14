const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('ユーザーにDMを送信します')
		.addUserOption(option =>
			option
				.setName("user")
				.setDescription("ユーザーを指定します。")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("text")
				.setDescription("送りたい文章を入力")
				.setRequired(true)
		)
		.addBooleanOption(option =>
			option
				.setName('silent')
				.setDescription('通知を無効にして送るかどうか')
				.setRequired(false) // 任意のオプション
		),
    execute: async function (interaction) {
        let isSilent = false;
		if (interaction.options.getBoolean('silent')) {
			isSilent = interaction.options.getBoolean('silent')
		}
		const msg = interaction.options.getString('text');

		const userId = interaction.options.getUser('user')
		const dmChannel = await userId.createDM();

		dmChannel.send({
			embeds: [{
				title: `${interaction.user.username}からのメッセージ`,
				thumbnail: {
					url: interaction.user.displayAvatarURL()
				},
				color: 0x5865f2,
				fields: [{
					name: "メッセージ",
					value: msg,
				}]
			}]
		});
    }
};