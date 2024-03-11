const { CommandManager } = require('../../internal/commands');

class AdminFeature {
	onLoad() {
		CommandManager.default.addCommands([
			require('./commands/globalban'),
			require('./commands/updater'),
		]);
	}
}

module.exports = { adminFeature: new AdminFeature() };
