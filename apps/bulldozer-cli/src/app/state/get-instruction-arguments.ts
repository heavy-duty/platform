import { Program } from '@heavy-duty/anchor';
import {
	InstructionArgumentFilters,
	instructionArgumentQueryBuilder,
} from '../query-builders';
import { Bulldozer } from '../utils/bulldozer';
import {
	getInstructionArgument,
	InstructionArgument,
} from './get-instruction-argument';

export const getInstructionArguments = async (
	program: Program<Bulldozer>,
	filters: InstructionArgumentFilters
): Promise<InstructionArgument[]> => {
	const query = instructionArgumentQueryBuilder().where(filters).build();

	const instructionArgumentIds =
		await program.provider.connection.getProgramAccounts(program.programId, {
			...query,
			dataSlice: {
				offset: 0,
				length: 0,
			},
		});

	return Promise.all(
		instructionArgumentIds.map(({ pubkey }) =>
			getInstructionArgument(program, pubkey)
		)
	);
};
