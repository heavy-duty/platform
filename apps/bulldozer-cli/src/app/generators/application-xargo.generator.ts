import * as Handlebars from 'handlebars';
import { applicationXargoTemplate } from './templates';
import { registerHandleBarsHelpers } from './utils';

export class ApplicationXargoGenerator {
	static generate() {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(applicationXargoTemplate);
		return template({});
	}
}
