// @ts-check

const { CommandManager } = require('../../internal/commands');

/**
 * @typedef {import("../../util/types").Feature} Feature
 */

/**
 * @implements {Feature}
 */
class WebApiFeature {
	onLoad() {
		CommandManager.default.addCommands([
			require('./commands/check'),
			require('./commands/mc_srvlookup'),
			require('./commands/mcstatus'),
			require('./commands/nettool'),
			require('./commands/nyanpass'),
		]);
	}
}

module.exports = { webApiFeature: new WebApiFeature() };
