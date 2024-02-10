const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const mongodb = require('../internal/mongodb') //*MongoDB
const { AdminUserIDs } = require("../config.json");
const Pager = require("../util/pager");

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
						.setRequired(true)
				))
		)
		.addSubcommand(subcommand => 
			subcommand
				.setName('list')
				.setDescription('グローバルBANリストの一覧を表示します。')
		),
    execute: async function (interaction) {
		const executorID = interaction.user.id; // executed by
		const subcommand = interaction.options.getSubcommand()
		if (!subcommand) {
			return await interaction.reply('ねえサブコマンド指定して?')
		}

		await interaction.deferReply();
		if (subcommand === 'sync') {
			const member = interaction.guild.members.cache.get(interaction.user.id);
			if (!member.permissions.has([PermissionsBitField.Flags.Administrator])) {
				return await interaction.editReply({ content: 'このコマンドを使用する権限がありません。使用するためには`ユーザーのBAN権限`、または`管理者`権限が必要です。', ephemeral: true });
			}
            try {
                // データベースから全てのユーザーを取得
                const userCollection = mongodb.connection.collection('globalBans');
                const allUsers = await userCollection.find({}).toArray();

                // ユーザー情報をログに表示
                await interaction.editReply('データベースと同期中...');
				const bans = await interaction.guild.bans.fetch()
				let banscount = 0;
                allUsers.forEach(user => {
                    console.log(`Banning user: ${user.userName} (${user.userId}), Reason: ${user.reason || 'Not provided'}`);
					let usrid = user.userId
					if (!bans.has(usrid)) {
						let reason = `${user.reason || '理由なし'}`
						interaction.guild.members.ban(user.userId, { reason: `グローバルBAN: ${reason}` });
						banscount++;
					}
					
                });

                return await interaction.editReply({
					embeds: [{
						title: "データベースと同期しました。",
						description: `BANされたユーザー: ${banscount}人`,
						color: 0xff0000,
						footer: {
							text: "Sekai.Explode"
						}
					}]
				});
            } catch (error) {
                console.error(error);
                await interaction.editReply('ねえエラーでたんだけど?\n```' + error + "\n```");
				return;
            }
		}
		let user = null;
		let reason = null;
		if (subcommand === 'add' || subcommand === 'remove') {
			if (!AdminUserIDs.includes(executorID)) {
				return await interaction.editReply('このBotの管理者のみが使用できます。');
			}
			user = interaction.options.getUser('user');
			reason = interaction.options.getString('reason')
		}


		//*add/rm
		if (subcommand === 'add') {
			try {
				const existingBan = await mongodb.connection.collection('globalBans').findOne({ userId: user.id });
        		if (existingBan) {
        		    return await interaction.editReply(`${user.tag}は既にグローバルBAN済みです!`);
        		}
				await mongodb.connection.collection('globalBans').insertOne({
					userId: user.id,
					userName: user.tag,
					reason: reason
				});
				let done = 0;
				let fail = 0;
				await interaction.client.guilds.cache.forEach(g => { // Botが参加しているすべてのサーバーで実行
					try {
						g.members.ban(user.id, { reason: `グローバルBAN: ${reason}` }) // メンバーをBAN
						done++;
					} catch(e) {
						fail++;
						if (e.code) {
							console.error(`Missing Perm/Unknown Error in ${g.name}. (Code: ${e.code})`)
						} else {
							console.log(g.name + "-> Failed\n" + e); // エラーが出たとき
						}
					}
				})
				await interaction.editReply(`${user.tag}をグローバルBANリストに追加しました。`);
				console.log(`Success: ${done} / Fail: ${fail}`)
				return;
			} catch (error) {
				console.error(error);
				await interaction.editReply('ねえエラーでたんだけど?\n```' + error + "\n```");
				return;
			}
		
		} else if (subcommand === 'remove') {
			try {
				const existingBan = await mongodb.connection.collection('globalBans').findOne({ userId: user.id });
        		if (!existingBan) {
        		    return await interaction.editReply(`${user.tag}はグローバルBANリストに登録されていません。`);
        		}

        		await mongodb.connection.collection('globalBans').deleteOne({ userId: user.id });
				let done = 0;
				let fail = 0;
				await interaction.client.guilds.cache.forEach(g => { // Botが参加しているすべてのサーバーで実行
					try {
						g.members.unban(user.id) // メンバーをBAN
						console.log(g.name + `-> Success`); // 成功したらコンソールに出す
						done++;
					} catch(e) {
						fail++;
						if (e.code) {
							console.error(`Missing Perm/Unknown Error in ${g.name}. (Code: ${e.code})`)
						} else {
							console.log(g.name + "-> Failed\n" + e); // エラーが出たとき
						}
					}
				})
				await interaction.editReply(`${user.tag}をグローバルBANリストから削除しました。`);
				console.log(`Success: ${done} / Fail: ${fail}`)
				return;
			} catch (error) {
				console.error(error);
				await interaction.editReply('ねえエラーでたんだけど?\n```' + error + "\n```");
				return;
			}
		



		//*LIST
		} else if (subcommand === 'list') {
			try {
				const userCollection = mongodb.connection.collection('globalBans');
				const bans = await userCollection.find({}).toArray();
				const pager = new Pager(bans.map(ban => `**${ban.userName} (${ban.userId})**: ${ban.reason || '理由なし'}`), {
					title:     pager => !pager.isEmpty() ? 'グローバルBANリスト' : 'エラー',
					color:     pager => !pager.isEmpty() ? 0xde2323 : 0xff0000,
					fieldName: pager => !pager.isEmpty() ? 'GBAN済ユーザーの一覧' : null,
					emptyMessage: 'BANリストにユーザーが存在しません。',
					footer(pager) {
						if (pager.isEmpty()) {
							return {
								text: 'Sekai.Explode'
							};
						}
						return {
							text: "Sekai.Explode Global Ban System | " + 
									`${pager.page + 1}/${pager.pageCount}ページ | ` +
									`${pager.items.length}件中${pager.start + 1}件目から${pager.end}件目`
						};
					}
				});
				pager.replyTo(interaction);
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