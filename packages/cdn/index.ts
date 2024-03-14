import { CommandManager } from '../../internal/commands';
import upload from './upload';

class CdnFeature {
	onLoad() {
		CommandManager.default.addCommands(upload);
	}
}

export const feature = new CdnFeature();
