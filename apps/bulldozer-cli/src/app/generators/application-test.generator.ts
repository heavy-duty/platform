import * as Handlebars from 'handlebars';
import { Application } from '../state';
import { applicationTestTemplate } from './templates';
import { formatName, registerHandleBarsHelpers } from './utils';

export class ApplicationTestGenerator {
	static generate(application: Application, programId: string) {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(applicationTestTemplate);
		return template({
			name: formatName(application.name),
			programId,
		});
	}
}
