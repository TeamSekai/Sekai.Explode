const { SlashCommandBuilder } = require('discord.js');
const mongodb = require('../internal/mongodb') //*MongoDB
const AdminuserIDs = ['1063527758292070591', '1126422758696427552'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gban')
        .setDescription('作成中')
		.addSubcommand(subcommand => 
			subcommand
				.setName('sync')
				.setDescription('データベースとの同期を行います。(BANされていないユーザーが居た場合には自動BANを行います。')
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('グローバルBANリストにユーザーを追加します.')
				.addUserOption(option => (
					option
						.setName("user")
						.setDescription("ユーザーを指定します。")
						.setRequired(true)
				))
				.addStringOption(option => (
					option
						.setName("reason")
						.setDescription("理由の記入")
						.setRequired(false)
				))
		)
		.addSubcommand(subcommand => 
			subcommand
				.setName('remove')
				.setDescription('グローバルBANリストからユーザーを削除します。')
				.addUserOption(option => (
					option
						.setName("user")
						.setDescription("enter user")
						.setRequired(false)
				))
				.addStringOption(option => (
					option
						.setName("reason")
						.setDescription("理由の記入")
						.setRequired(false)
				))
		)
		.addSubcommand(subcommand => 
			subcommand
				.setName('list')
				.setDescription('グローバルBANリストの一覧を表示します。')
		),
    execute: async function (interaction) {
		const executorID = interaction.user.id; // executed by

		// checkid
		if (!AdminuserIDs.includes(executorID)) {
    		return await interaction.reply('あ、未完成っす。ごめんね。');
    	}
		const subcommand = interaction.options.getSubcommand()
		if (!subcommand) {
			return await interaction.reply('ねえサブコマンド指定して?')
		}

		let user = null;
		let reason = null;
		if (subcommand === 'add' || subcommand === 'remove') {
			user = interaction.options.getUser('user');
			reason = interaction.options.getString('reason')
		}
		if (subcommand === 'add') {
			try {
				await mongodb.connection.collection('globalBans').insertOne({
					userId: user.id,
					userName: user.tag,
					reason: reason
				});
				await interaction.reply(`${user.tag}をグローバルBANリストに追加しました。`);
			} catch (error) {
				console.error(error);
				await interaction.reply('ねえエラーでたんだけど?\n```' + error + "\n```");
			}
		
		} else if (subcommand === 'remove') {
			try {
				await mongodb.connection.collection('globalBans').deleteOne({
					userId: user.id,
					userName: user.tag,
					reason: reason
				});
				await interaction.reply(`${user.tag}をグローバルBANリストから削除しました。`);
			} catch (error) {
				console.error(error);
				await interaction.reply('ねえエラーでたんだけど?\n```' + error + "\n```");
			}
		} else if (subcommand === 'list') {
			try {
				const userCollection = mongodb.connection.collection('globalBans');
				const bans = await userCollection.find({}).toArray();
				
				if (bans.length > 0) {
					const embed = {
                        title: 'グローバルBANリスト',
                        color: '#ff0000',
                        fields: [{
                            name: "ユーザー名: 理由",
                            value: bans.map(ban => `**${ban.userName} (${ban.userId})**: ${ban.reason || '理由なし'}`).join('\n')
                        }]
                    };

                    await interaction.reply({ embeds: [embed] });
				} else {
					await interaction.reply('グローバルBANリストにはユーザーが登録されていません。');
				}
			} catch (error) {
				console.error(error);
				await interaction.reply('ねえエラーでたんだけど?\n```' + error + "\n```");
			}
		} else {
			return await interaction.reply('Something Went Wrong')
		}
		
    }
};