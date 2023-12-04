const { Client, Events, Intents, Status, ActivityType } = require('discord.js');


console.log('Loaded activity.js')


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
	setupActivity(client){
		client.on('ready', async () => {
			setInterval(() => {
				const wsping = client.ws.ping;
				addPingValue(wsping)
				// avg
				const avgPing = wspingValues.reduce((sum, value) => sum + value, 0) / wspingValues.length;
				client.user.setPresence({
					activities: [{
						name: `Created by ringoXD`,
						state: `Running on Node.js...\nPing: ${client.ws.ping}(avg: ${avgPing})`,
						type: ActivityType.Watching,
					}],
					Status: `online`,
				});
			}, 40000)
		})
	},
	addPingValue,
	getPingValues
  };