const { SlashCommandBuilder } = require('discord.js');
const { LANG, strFormat } = require('../util/languages');
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName(LANG.commands.dm.name)
        .setDescription(LANG.commands.dm.description)
		.addUserOption(option =>
			option
				.setName(LANG.commands.dm.options.user.name)
				.setDescription(LANG.commands.dm.options.user.description)
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName(LANG.commands.dm.options.text.name)
				.setDescription(LANG.commands.dm.options.text.description)
				.setRequired(true)
		),
		/* .addBooleanOption(option =>
			option
				.setName('silent')
				.setDescription('通知を無効にして送るかどうか')
				.setRequired(false) // 任意のオプション
		),
		*/
    execute: async function (interaction) {
		const cooldownTime = 10;
		
		const executorId = interaction.user.id
		if (cooldowns.has(executorId)) {
			const expirationTime = cooldowns.get(executorId);
			const currTime = Date.now();

			const remainingTime = Math.ceil((expirationTime - currTime) / 1000);
			if (remainingTime > 0) {
				return interaction.reply(strFormat(LANG.commands.dm.cooldown, [remainingTime]));

			}
		}

        let isSilent = false;
		if (interaction.options.getBoolean('silent')) {
			isSilent = interaction.options.getBoolean('silent')
		}
		const msg = interaction.options.getString(LANG.commands.dm.options.text.name);

		const userId = interaction.options.getUser(LANG.commands.dm.options.user.name);
		const dmChannel = await userId.createDM();

		dmChannel.send({
			embeds: [{
				title: strFormat(LANG.commands.dm.messageTitle, [interaction.user.username]),
				thumbnail: {
					url: interaction.user.displayAvatarURL()
				},
				color: 0x5865f2,
				fields: [{
					name: LANG.commands.dm.messageFieldName,
					value: msg,
				}]
			}]
		});
		
		const userName = userId.username
		await interaction.reply(strFormat(LANG.commands.dm.dmSent, [userName]))
		

		const expirationTime = Date.now() + cooldownTime * 1000;
		cooldowns.set(executorId, expirationTime)

    }
};