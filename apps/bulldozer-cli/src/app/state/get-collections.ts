import { Program } from '@heavy-duty/anchor';
import { CollectionFilters, collectionQueryBuilder } from '../query-builders';
import { Bulldozer } from '../utils/bulldozer';
import { Collection, getCollection } from './get-collection';

export const getCollections = async (
	program: Program<Bulldozer>,
	filters: CollectionFilters
): Promise<Collection[]> => {
	const query = collectionQueryBuilder().where(filters).build();

	const collectionIds = await program.provider.connection.getProgramAccounts(
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
		collectionIds.map(({ pubkey }) => getCollection(program, pubkey))
	);
};
