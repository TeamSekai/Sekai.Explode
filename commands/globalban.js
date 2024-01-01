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
						.setRequired(false)
				))
		)
		.addSubcommand(subcommand => 
			subcommand
				.setName('dev-add')
				.setDescription('admin only')
				.addUserOption(option => (
					option
						.setName("user")
						.setDescription("enter id")
						.setRequired(false)
				))
		)
		.addSubcommand(subcommand => 
			subcommand
				.setName('dev-rm')
				.setDescription('admin only')
				.addUserOption(option => (
					option
						.setName("user")
						.setDescription("enter id")
						.setRequired(false)
				))
		)
		.addSubcommand(subcommand => 
			subcommand
				.setName('dev-view')
				.setDescription('admin only')
				.setRequired(false)
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

		if (subcommand === 'dev-add') {
			const user = interaction.options.getUser('user');
			try {
				await mongodb.connection.collection('globalBans').insertOne({ userId: user.id });
				await interaction.reply(`${user.tag}をグローバルBANリストに追加しました。`);
			} catch (error) {
				console.error(error);
				await interaction.reply('ねえエラーでたんだけど?\n```' + error + "\n```");
			}
		
		} else if (subcommand === 'dev-rm') {
			// userIdをデータベースから削除
			await interaction.reply('ねえエラーでたんだけど?\n```' + error + "\n```");
			try {
				await mongodb.connection.collection('globalBans').deleteOne({ userId: user.id });
				await interaction.reply(`${user.tag}をグローバルBANリストから削除しました。`);
			} catch (error) {
				console.error(error);
				await interaction.reply('ねえエラーでたんだけど?\n```' + error + "\n```");
			}
		} else if (subcommand === 'dev-view') {
			try {
				const userCollection = mongodb.connection.collection('users'); // usersは適切なコレクション名に変更してください
				const userIds = await userCollection.distinct('userId');
				
				if (userIds.length > 0) {
					const formattedUserIds = userIds.map(id => `<@${id}>`).join(', '); // ユーザーIDをメンション形式に変換
					await interaction.reply(`ユーザーIDのリスト:\n${formattedUserIds}`);
				} else {
					await interaction.reply('ユーザーIDが見つかりませんでした。');
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