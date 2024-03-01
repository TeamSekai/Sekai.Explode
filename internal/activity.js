const { Client, Events, Intents, Status, ActivityType } = require("discord.js");
const { LANG, strFormat } = require("../util/languages");
const { onShutdown } = require("./schedules");

console.log(LANG.internal.activity.called);

// 10秒毎に更新

let wspingValues = [];

// add
function addPingValue(ping) {
	wspingValues.push(ping);

	// autoremove(30)
	if (wspingValues.length > 30) {
		wspingValues.shift(); // 最も古い値を削除
	}
}

// get
function getPingValues() {
	return wspingValues;
}

module.exports = {
	/**
	 * @param {Client<boolean>} client
	 */
	setupActivity(client) {
		client.on("ready", async () => {
			const intervalId = setInterval(() => {
				const wsping = client.ws.ping;
				addPingValue(wsping);
				// avg
				const avgPing =
					wspingValues.reduce((sum, value) => sum + value, 0) /
					wspingValues.length;
				client.user.setPresence({
					activities: [
						{
							name: LANG.internal.activity.presenceName,
							state: strFormat(LANG.internal.activity.presenceState, [
								client.ws.ping,
							]),
							type: ActivityType.Watching,
						},
					],
					status: `online`,
				});
			}, 40000);
			onShutdown(() => {
				clearInterval(intervalId);
				client.user.setPresence({
					activities: [
						{
							name: LANG.internal.activity.presenceNameShuttingDown,
							state: LANG.internal.activity.presenceStateShuttingDown,
							type: ActivityType.Watching,
						},
					],
					status: "idle",
				});
			});
		});
	},
	addPingValue,
	getPingValues,
};
