const { CommandManager } = require('../../internal/commands');
const templinkCommand = require('./command');
const { enableTempLinks, disableTempLinks } = require('./templinks');

/**
 * @implements {import("../../util/types").Feature}
 */
class TempLinkFeature {
	onLoad() {
		enableTempLinks();
		CommandManager.default.addCommands(templinkCommand);
	}

	onUnload() {
		disableTempLinks();
	}
}

module.exports = { templinkFeature: new TempLinkFeature() };
