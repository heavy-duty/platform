import { Program } from '@heavy-duty/anchor';
import {
	InstructionAccountFilters,
	instructionAccountQueryBuilder,
} from '../query-builders';
import { Bulldozer } from '../utils/bulldozer';
import {
	getInstructionAccount,
	InstructionAccount,
} from './get-instruction-account';

export const getInstructionAccounts = async (
	program: Program<Bulldozer>,
	filters: InstructionAccountFilters
): Promise<InstructionAccount[]> => {
	const query = instructionAccountQueryBuilder().where(filters).build();

	const instructionAccountIds =
		await program.provider.connection.getProgramAccounts(program.programId, {
			...query,
			dataSlice: {
				offset: 0,
				length: 0,
			},
		});

	return Promise.all(
		instructionAccountIds.map(({ pubkey }) =>
			getInstructionAccount(program, pubkey)
		)
	);
};
