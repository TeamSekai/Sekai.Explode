const { SlashCommandBuilder } = require('@discordjs/builders');
const AdminuserIDs = ['1063527758292070591', '1126422758696427552'];
const childprocess = require('child_process');
const path = require("path");
const color = require("colors");
module.exports = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('git pull'),
  execute: async function(interaction) {

	const executorID = interaction.user.id; // 実行者のユーザーID

	// checkid
	if (!AdminuserIDs.includes(executorID)) {
    	await interaction.reply('このコマンドはBotの管理者のみ使えます。');
    	return;
    }

	let msg = ">".yellow + " git pull\n".green;
    await interaction.reply("```ansi\n" + msg + "\n```");
    let lock = false;
    let lockTimeout = null;
    let gitProcess = childprocess.spawn("git", ["-c", "color.ui=always", "pull"], {
        cwd: path.resolve(__dirname)
    });
    let timeout = setTimeout(() => {
        gitProcess.kill();
        interaction.editReply(`3分経っても処理が完了しなかったため、強制終了しました`);
    }, 1000 * 60 * 3);
    gitProcess.stdout.on("data", data => {
        msg += data.toString().replace(/\x1b\[m/g, "\x1b[0m");
        if (!lock) {
            interaction.editReply("<a:loading:1071641234310955129> 更新中...\n" + "```ansi\n" + msg + "\n```");
            lock = true;
        }
        if (lockTimeout)
            clearTimeout(lockTimeout);
        lockTimeout = setTimeout(() => {
            lock = false;
        }, 1000);
    });
    gitProcess.stderr.on("data", data => {
        console.error(data.toString())
    })
    gitProcess.on("close", async () => {
        clearTimeout(timeout);
        await interaction.editReply("```ansi\n" + msg + "\n```\n" + "<:check:962405846002847754> 完了\nBOTを再起動します");
        setTimeout(() => {
            process.exit(0);
        }, 5000);
    })

  },
};