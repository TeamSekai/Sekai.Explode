const { SlashCommandBuilder } = require("discord.js");
const { AdminUserIDs } = require("../config.json");
const childprocess = require("child_process");
const path = require("path");
const { LANG } = require("../util/languages");
const { shutdown } = require("../internal/schedules");

module.exports = {
	data: new SlashCommandBuilder()
		.setName(LANG.commands.updater.name)
		.setDescription(LANG.commands.updater.description),
	execute: async function (interaction) {
		const executorID = interaction.user.id; // 実行者のユーザーID

		// checkid
		if (!AdminUserIDs.includes(executorID)) {
			await interaction.reply(LANG.commands.updater.permissionError);
			return;
		}

		let msg = ">".yellow + " git pull\n".green;
		await interaction.reply(
			LANG.commands.updater.updating + "\n" + "```ansi\n" + msg + "\n```",
		);
		let lock = false;
		let lockTimeout = null;
		let gitProcess = childprocess.spawn(
			"git",
			["-c", "color.ui=always", "pull"],
			{
				cwd: path.resolve(__dirname),
			},
		);
		let timeout = setTimeout(
			() => {
				gitProcess.kill();
				interaction.editReply(LANG.commands.updater.timeout);
			},
			1000 * 60 * 3,
		);
		gitProcess.stdout.on("data", (data) => {
			msg += data.toString().replace(/\x1b\[m/g, "\x1b[0m");
			if (!lock) {
				interaction.editReply(
					LANG.commands.updater.updating + "\n" + "```ansi\n" + msg + "\n```",
				);
				lock = true;
			}
			if (lockTimeout) clearTimeout(lockTimeout);
			lockTimeout = setTimeout(() => {
				lock = false;
			}, 1000);
		});
		gitProcess.stderr.on("data", (data) => {
			console.error(data.toString());
		});
		gitProcess.on("close", async () => {
			clearTimeout(timeout);
			await interaction.editReply(
				"```ansi\n" +
					msg +
					"\n```\n" +
					LANG.commands.updater.restarting.join("\n"),
			);
			shutdown();
		});
	},
};
