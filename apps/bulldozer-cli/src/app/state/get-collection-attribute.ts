import { Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Bulldozer } from '../utils/bulldozer';

type Option<T> = T | null;

export interface CollectionAttribute {
	publicKey: PublicKey;
	name: string;
	authority: PublicKey;
	workspace: PublicKey;
	application: PublicKey;
	collection: PublicKey;
	kind: {
		id: number;
		name: string;
		size: number;
	};
	modifier: Option<{
		id: number;
		name: string;
		size: number;
	}>;
	createdAt: Date;
	updatedAt: Date;
}

export const getCollectionAttribute = async (
	program: Program<Bulldozer>,
	collectionAttributePublicKey: PublicKey
): Promise<CollectionAttribute | null> => {
	const collectionAttributeAccount =
		await program.account.collectionAttribute.fetchNullable(
			collectionAttributePublicKey
		);

	if (collectionAttributeAccount === null) {
		return null;
	}

	const kindName = Object.keys(collectionAttributeAccount.kind)[0];
	const modifierName =
		collectionAttributeAccount.modifier !== null
			? Object.keys(collectionAttributeAccount.modifier)[0]
			: null;

	return {
		publicKey: collectionAttributePublicKey,
		name: collectionAttributeAccount.name,
		authority: collectionAttributeAccount.authority,
		workspace: collectionAttributeAccount.workspace,
		application: collectionAttributeAccount.application,
		collection: collectionAttributeAccount.collection,
		kind: {
			id: collectionAttributeAccount.kind[kindName].id,
			name: kindName,
			size: collectionAttributeAccount.kind[kindName].size,
		},
		modifier:
			modifierName !== null
				? {
						id: collectionAttributeAccount.modifier[modifierName].id,
						name: modifierName,
						size: collectionAttributeAccount.modifier[modifierName].size,
				  }
				: null,
		createdAt: new Date(collectionAttributeAccount.createdAt.toNumber() * 1000),
		updatedAt: new Date(collectionAttributeAccount.updatedAt.toNumber() * 1000),
	};
};
