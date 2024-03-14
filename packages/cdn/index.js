// @ts-check

const { CommandManager } = require('../../internal/commands');
const upload = require('./upload');

class CdnFeature {
	onLoad() {
		CommandManager.default.addCommands(upload);
	}
}

module.exports = { feature: new CdnFeature() };
