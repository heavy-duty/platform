import * as Handlebars from 'handlebars';
import { workspacePackagejsonTemplate } from './templates';
import { registerHandleBarsHelpers } from './utils';

export class WorkspacePackagejsonGenerator {
	static generate() {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(workspacePackagejsonTemplate);
		return template({});
	}
}
