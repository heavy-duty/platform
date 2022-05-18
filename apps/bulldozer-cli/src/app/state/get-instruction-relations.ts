import { Program } from '@heavy-duty/anchor';
import {
	InstructionRelationFilters,
	instructionRelationQueryBuilder,
} from '../query-builders';
import { Bulldozer } from '../utils/bulldozer';
import {
	getInstructionRelation,
	InstructionRelation,
} from './get-instruction-relation';

export const getInstructionRelations = async (
	program: Program<Bulldozer>,
	filters: InstructionRelationFilters
): Promise<InstructionRelation[]> => {
	const query = instructionRelationQueryBuilder().where(filters).build();

	const instructionRelationIds =
		await program.provider.connection.getProgramAccounts(program.programId, {
			...query,
			dataSlice: {
				offset: 0,
				length: 0,
			},
		});

	return Promise.all(
		instructionRelationIds.map(({ pubkey }) =>
			getInstructionRelation(program, pubkey)
		)
	);
};
