import { Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Bulldozer } from '../utils/bulldozer';

export interface Collection {
	publicKey: PublicKey;
	name: string;
	authority: PublicKey;
	workspace: PublicKey;
	application: PublicKey;
	quantityOfAttributes: number;
	createdAt: Date;
	updatedAt: Date;
}

export const getCollection = async (
	program: Program<Bulldozer>,
	collectionPublicKey: PublicKey
): Promise<Collection | null> => {
	const collectionAccount = await program.account.collection.fetchNullable(
		collectionPublicKey
	);

	if (collectionAccount === null) {
		return null;
	}

	const collectionStatsPublicKey = await PublicKey.createProgramAddress(
		[
			Buffer.from('collection_stats', 'utf8'),
			collectionPublicKey.toBuffer(),
			Buffer.from([collectionAccount.collectionStatsBump]),
		],
		program.programId
	);

	const collectionStatsAccount =
		await program.account.collectionStats.fetchNullable(
			collectionStatsPublicKey
		);

	if (collectionStatsAccount === null) {
		return null;
	}

	return {
		publicKey: collectionPublicKey,
		name: collectionAccount.name,
		authority: collectionAccount.authority,
		workspace: collectionAccount.workspace,
		application: collectionAccount.application,
		quantityOfAttributes: collectionStatsAccount.quantityOfAttributes,
		createdAt: new Date(collectionAccount.createdAt.toNumber() * 1000),
		updatedAt: new Date(collectionAccount.updatedAt.toNumber() * 1000),
	};
};
