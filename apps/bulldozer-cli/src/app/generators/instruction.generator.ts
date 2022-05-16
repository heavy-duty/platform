import * as Handlebars from 'handlebars';
import {
	Instruction,
	InstructionAccount,
	InstructionArgument,
	InstructionRelation,
} from '../state';
import { instructionTemplate } from './templates';
import { formatName, registerHandleBarsHelpers } from './utils';

export class InstructionCodeGenerator {
	static generate(
		instruction: Instruction,
		instructionArguments: InstructionArgument[],
		instructionAccounts: InstructionAccount[],
		instructionRelations: InstructionRelation[]
	) {
		registerHandleBarsHelpers();

		const template = Handlebars.compile(instructionTemplate);
		return template({
			instruction: {
				name: formatName(instruction.name),
				body: instruction.body.split('\n'),
			},
			instructionArguments: instructionArguments.map((instructionArgument) => ({
				name: formatName(instructionArgument.name),
				kind: instructionArgument.kind,
				modifier: instructionArgument.modifier,
			})),
			instructionAccounts: instructionAccounts.map((instructionAccount) => ({
				name: formatName(instructionAccount.name),
				kind: instructionAccount.kind,
				modifier: instructionAccount.modifier,
				collection: instructionAccount.collection
					? formatName(instructionAccount.collection.name)
					: null,
				payer:
					instructionAccount.payer !== null
						? formatName(instructionAccount.payer.name)
						: null,
				close: instructionAccount.close
					? formatName(instructionAccount.close.name)
					: null,
				space: instructionAccount.space,
				relations: instructionRelations
					.filter((instructionRelation) =>
						instructionRelation.from.publicKey.equals(
							instructionAccount.publicKey
						)
					)
					.map((instructionRelation) =>
						formatName(instructionRelation.to.name)
					),
			})),
			collections: instructionAccounts
				.filter((instructionAccount) => instructionAccount.collection !== null)
				.map((instructionAccount) =>
					formatName(instructionAccount.collection.name)
				),
		});
	}
}
