const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Lookup Server/User Info')
		.addSubcommand(subcommand =>
            subcommand
                .setName('user')
				.setDescription('ユーザーの情報を調べます!')
				.addUserOption(option => (
					option
						.setName("target")
						.setDescription("ユーザーを指定します。")
						.setRequired(true)
				))
		)
		.addSubcommand(subcommand =>
            subcommand
                .setName('server')
				.setDescription('サーバーの情報を調べます!')
		),
		execute: async function (interaction) {
			const subcommand = interaction.options.getSubcommand();
			if (subcommand === 'user') {
				await interaction.reply("さーせん、こいつまだ作ってないんすわ")
			}
			if (subcommand === 'server') {
				const guild = interaction.guild;
				const gmembers = guild.memberCount;
				const gchannels = guild.channels.cache.size;
				const gvoicechannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
				const groles = guild.roles.cache.size;
				const boostStatus = guild.premiumSubscriptionCount > 0 ? `ブースト中（ブースト数: ${guild.premiumSubscriptionCount}）` : 'ブーストなし';
				const createdAt = guild.createdAt.toDateString();

				const serverInfoMessage = `サーバーの情報\n
					人数: ${gmembers}\n
					テキストチャンネル数: ${gchannels}\n
					ボイスチャンネル数: ${gvoicechannels}\n
					ロール数: ${groles}\n
					作成日: ${createdAt}\n
					ブースト状態: ${boostStatus}`;

				await interaction.reply(serverInfoMessage);
			}
		}
};