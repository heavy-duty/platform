export interface CollectionAttribute {
	id: string;
	name: string;
	collectionId: string;
	kind: {
		id: number;
		size: number;
	};
}

export interface Collection {
	id: string;
	name: string;
}

export interface InstructionAccountsCollectionsLookup {
	id: string;
	collection: string | null;
}

export interface InstructionAccount {
	id: string;
	name: string;
	collection: string | null;
	kind: {
		id: number;
		name: string;
	};
}
