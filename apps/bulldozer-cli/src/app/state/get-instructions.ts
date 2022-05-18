import { Program } from '@heavy-duty/anchor';
import { InstructionFilters, instructionQueryBuilder } from '../query-builders';
import { Bulldozer } from '../utils/bulldozer';
import { getInstruction, Instruction } from './get-instruction';

export const getInstructions = async (
	program: Program<Bulldozer>,
	filters: InstructionFilters
): Promise<Instruction[]> => {
	const query = instructionQueryBuilder().where(filters).build();

	const instructionIds = await program.provider.connection.getProgramAccounts(
		program.programId,
		{
			...query,
			dataSlice: {
				offset: 0,
				length: 0,
			},
		}
	);

	return Promise.all(
		instructionIds.map(({ pubkey }) => getInstruction(program, pubkey))
	);
};
