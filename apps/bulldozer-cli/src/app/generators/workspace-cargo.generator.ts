import * as Handlebars from 'handlebars';
import { workspaceCargoTemplate } from './templates';
import { registerHandleBarsHelpers } from './utils';

export class WorkspaceCargoGenerator {
	static generate() {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(workspaceCargoTemplate);
		return template({});
	}
}
