import * as Handlebars from 'handlebars';
import { Workspace } from '../state';
import { workspaceReadmeTemplate } from './templates';
import { formatName, registerHandleBarsHelpers } from './utils';

export class WorkspaceReadmeGenerator {
	static generate(workspace: Workspace) {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(workspaceReadmeTemplate);
		return template({
			name: formatName(workspace.name),
		});
	}
}
