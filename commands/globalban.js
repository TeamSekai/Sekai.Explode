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

		await interaction.deferReply();
		if (subcommand === 'sync') {
            try {
                // データベースから全てのユーザーを取得
                const userCollection = mongodb.connection.collection('globalBans');
                const allUsers = await userCollection.find({}).toArray();

                // ユーザー情報をログに表示
                await interaction.editReply('データベースと同期中...');
				const bans = await interaction.guild.bans.fetch()
                allUsers.forEach(user => {
                    console.log(`Banning user: ${user.userName} (${user.userId}), Reason: ${user.reason || 'Not provided'}`);
					let usrid = user.userId
					if (!bans.has.usrid) {
						let reason = `${user.reason || '理由なし'}`
						interaction.guild.members.ban(user.userId, { reason: `グローバルBAN: ${reason}` });
					}
					
                });

                await interaction.editReply('データベースと同期しました。');
            } catch (error) {
                console.error(error);
                await interaction.editReply('ねえエラーでたんだけど?\n```' + error + "\n```");
				return;
            }
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
				await interaction.editReply(`${user.tag}をグローバルBANリストに追加しました。`);
			} catch (error) {
				console.error(error);
				await interaction.editReply('ねえエラーでたんだけど?\n```' + error + "\n```");
				return;
			}
		
		} else if (subcommand === 'remove') {
			try {
				await mongodb.connection.collection('globalBans').deleteOne({
					userId: user.id,
					userName: user.tag,
					reason: reason
				});
				await interaction.editReply(`${user.tag}をグローバルBANリストから削除しました。`);
			} catch (error) {
				console.error(error);
				await interaction.editReply('ねえエラーでたんだけど?\n```' + error + "\n```");
				return;
			}
		} else if (subcommand === 'list') {
			try {
				const userCollection = mongodb.connection.collection('globalBans');
				const bans = await userCollection.find({}).toArray();
				
				if (bans.length > 0) {
					const embed = {
                        title: 'グローバルBANリスト',
                        color: 0xde2323,
                        fields: [{
                            name: "GBAN済ユーザーの一覧",
                            value: bans.map(ban => `**${ban.userName} (${ban.userId})**: ${ban.reason || '理由なし'}`).join('\n')
                        }],
						footer: {
							text: `Sekai.Explode Global Ban System`
						}
                    };

                    await interaction.editReply({ embeds: [embed] });
				} else {
					return await interaction.editReply({
						embeds: [{
							title: "エラー",
							description: `BANリストにユーザーが存在しません。`,
							color: 0xff0000,
							footer: {
								text: "Sekai.Explode"
							}
						}]
					});
				}
			} catch (error) {
				console.error(error);
				
				return await interaction.editReply({
					embeds: [{
						title: "エラー",
						description: `内部エラー: ${error}`,
						color: 0xff0000,
						footer: {
							text: "Sekai.Explode"
						}
					}]
				});
			}
		} else {
			return await interaction.editReply('Something Went Wrong')
		}
		
    }
};