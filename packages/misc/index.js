const fs = require('fs');
const path = require('path');

const { CommandManager } = require('../../internal/commands');

class MiscFeature {
	onLoad() {
		fs.readdirSync(path.join(__dirname, 'commands'), {
			withFileTypes: true,
		}).forEach((file) => {
			if (!file.isFile() || path.extname(file.name) != '.js') return;
			const cmds = require(path.join(__dirname, 'commands', file.name));
			CommandManager.default.addCommands(cmds);
		});
	}
}

module.exports = { miscFeature: new MiscFeature() };
