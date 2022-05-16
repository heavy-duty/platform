import { Program } from '@heavy-duty/anchor';
import {
	CollectionAttributeFilters,
	collectionAttributeQueryBuilder,
} from '../query-builders';
import { Bulldozer } from '../utils/bulldozer';
import {
	CollectionAttribute,
	getCollectionAttribute,
} from './get-collection-attribute';

export const getCollectionAttributes = async (
	program: Program<Bulldozer>,
	filters: CollectionAttributeFilters
): Promise<CollectionAttribute[]> => {
	const query = collectionAttributeQueryBuilder().where(filters).build();

	const collectionAttributeIds =
		await program.provider.connection.getProgramAccounts(program.programId, {
			...query,
			dataSlice: {
				offset: 0,
				length: 0,
			},
		});

	return Promise.all(
		collectionAttributeIds.map(({ pubkey }) =>
			getCollectionAttribute(program, pubkey)
		)
	);
};
