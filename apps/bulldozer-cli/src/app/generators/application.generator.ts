import * as Handlebars from 'handlebars';
import { Application, Instruction } from '../state';
import { applicationTemplate } from './templates';
import { formatName, registerHandleBarsHelpers } from './utils';

export class ApplicationCodeGenerator {
	static generate(
		application: Application,
		applicationInstructions: Instruction[],
		programId: string
	) {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(applicationTemplate);
		return template({
			application: formatName(application.name),
			instructions: applicationInstructions.map((instruction) => ({
				name: formatName(instruction.name),
				quantityOfArguments: instruction.quantityOfArguments,
			})),
			programId,
		});
	}
}
