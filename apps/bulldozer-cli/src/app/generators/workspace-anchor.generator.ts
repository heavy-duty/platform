import { PublicKey } from '@solana/web3.js';
import * as Handlebars from 'handlebars';
import { Application } from '../state';
import { workspaceAnchorTemplate } from './templates';
import { formatName, registerHandleBarsHelpers } from './utils';

export class WorkspaceAnchorGenerator {
	static generate(applications: Application[], programIds: PublicKey[]) {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(workspaceAnchorTemplate);
		return template({
			applications: applications.map((application, index) => ({
				name: formatName(application.name),
				programId: programIds[index],
			})),
		});
	}
}
