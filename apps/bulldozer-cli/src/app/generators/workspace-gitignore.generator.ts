import * as Handlebars from 'handlebars';
import { workspaceGitignoreTemplate } from './templates';
import { registerHandleBarsHelpers } from './utils';

export class WorkspaceGitignoreGenerator {
	static generate() {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(workspaceGitignoreTemplate);
		return template({});
	}
}
