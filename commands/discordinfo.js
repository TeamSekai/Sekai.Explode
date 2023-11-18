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
				const user = interaction.options.getUser('target')
				const member = await interaction.guild.members.fetch(user.id)
				const username = user.username
				const userid = user.id
				const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`; //*ChatGPT MOMENT
				const joinDate = `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`;
				const roles = member.roles.cache
					.filter(role => role.id !== interaction.guild.roles.everyone.id)
					.map(role => role.name)
					.join(', ');

				const userInfoMessage = `ユーザーの情報\n
                名前: ${username} (id: ${userid})\n
                アカウント作成日: ${createdAt}\n
                サーバー参加日: ${joinDate}\n
                所持しているロール: ${roles}`;

				await interaction.reply(userInfoMessage);

			}
			if (subcommand === 'server') {
				const guild = interaction.guild;
				const gmembers = guild.memberCount;
				const gchannels = guild.channels.cache.size;
				const gvoicechannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
				const groles = guild.roles.cache.size;
				const boostStatus = guild.premiumSubscriptionCount > 0 ? `ブースト中（${guild.premiumSubscriptionCount} Boost!）` : 'ブーストなし';
				const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`;
				console.log(`${guild.createdAt} - ${createdAt}`)

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