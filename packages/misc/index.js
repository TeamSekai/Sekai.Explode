const fs = require('fs');
const path = require('path');

const { CommandManager } = require('../../internal/commands');

class MiscFeature {
	onLoad() {
		fs.readdirSync(path.join(__dirname, 'commands'), {
			withFileTypes: true,
		}).forEach((file) => {
			const ext = path.extname(file.name);
			if (!file.isFile() || (ext != '.js' && ext != '.ts')) return;
			const cmds = require(path.join(__dirname, 'commands', file.name));
			CommandManager.default.addCommands(cmds);
		});
	}
}

module.exports = { feature: new MiscFeature() };
