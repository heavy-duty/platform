import * as Handlebars from 'handlebars';
import { Application } from '../state';
import { applicationCargoTemplate } from './templates';
import { formatName, registerHandleBarsHelpers } from './utils';

export class ApplicationCargoGenerator {
	static generate(application: Application, dependencies: string[]) {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(applicationCargoTemplate);
		return template({
			application: formatName(application.name),
			dependencies,
		});
	}
}
