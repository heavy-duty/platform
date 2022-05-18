import * as Handlebars from 'handlebars';
import { workspaceTsconfigTemplate } from './templates';
import { registerHandleBarsHelpers } from './utils';

export class WorkspaceTsconfigGenerator {
	static generate() {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(workspaceTsconfigTemplate);
		return template({});
	}
}
