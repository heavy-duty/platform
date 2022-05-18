import * as Handlebars from 'handlebars';
import { applicationImportsTemplate } from './templates';
import { formatName, registerHandleBarsHelpers } from './utils';

export class ApplicationImportsGenerator {
	static generate(imports: string[]) {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(applicationImportsTemplate);
		return template({
			entries: imports.map((importName) => formatName(importName)),
		});
	}
}
