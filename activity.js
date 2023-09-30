const { Client, Events, Intents, Status, ActivityType } = require('discord.js');


console.log('Loaded activity.js')


// 10秒毎に更新

let wspingValues = [];

module.exports = (client) => {
	client.on('ready', async () => {
		setInterval(() => {
			const wsping = client.ws.ping;
			wspingValues.push(wsping);
	
			if (wspingValues.length > 30) {
				wspingValues.shift(); // 最も古い値を削除
			}
			// avg
		//	const avgPing = wspingValues.reduce((sum, value) => sum + value, 0) / wspingValues.length;
			client.user.setActivity({
				name: `[${client.ws.ping}ms] | Created by ringoXD`,
				type: `LISTENING`,
				Status: `online`
			})
		}, 10000)
	})
};