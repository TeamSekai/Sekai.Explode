// @ts-check

/** @type {import("../../util/types").Feature} */
const playerFeature = {
	onLoad(commands) {
		commands.addCommands([
			require('./commands/pause'),
			require('./commands/play'),
			require('./commands/queue'),
			require('./commands/resume'),
			require('./commands/skip'),
			require('./commands/stop'),
			require('./commands/volume'),
		]);
	},
};

module.exports = {
	playerFeature,
	...require('./players'),
};
