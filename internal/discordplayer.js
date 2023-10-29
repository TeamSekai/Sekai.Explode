const { Player } = require('discord-player');

module.exports = (client) => {
	// this is the entrypoint for discord-player based application
	console.log('Loading Discord-Player')
	const player = new Player(client);

	// this event is emitted whenever discord-player starts to play a track
	// add the trackStart event so when a song will be played this message will be sent
	player.on("trackStart", (queue, track) => {
		queue.metadata.channel.send(`🎶 **${track.title}**を再生中`)
	});
	console.log('OK')

	return player;
}