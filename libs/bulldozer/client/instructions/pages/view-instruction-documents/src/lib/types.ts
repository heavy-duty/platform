export interface CollectionItemView {
	id: string;
	name: string;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	applicationId: string;
	workspaceId: string;
}

export interface CollectionAttributeItemView {
	id: string;
	name: string;
	kind: {
		id: number;
		name: string;
		size: number;
	};
	modifier: {
		id: number;
		name: string;
		size: number;
	} | null;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	collectionId: string;
	applicationId: string;
	workspaceId: string;
}

export interface InstructionAccountItemView {
	id: string;
	name: string;
	kind: {
		id: number;
		name: string;
	};
	modifier: {
		id: number;
		name: string;
	} | null;
	space: number | null;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	instructionId: string;
	applicationId: string;
	workspaceId: string;
	collection: string | null;
	close: string | null;
	payer: string | null;
	derivation: string | null;
	uncheckedExplanation: string | null;
	tokenAuthority: string | null;
	mint: string | null;
}

export interface InstructionAccountPayerItemView {
	id: string;
	payer: string | null;
	isUpdating: boolean;
}

export interface InstructionAccountCollectionItemView {
	id: string;
	collection: string | null;
	isUpdating: boolean;
}

export interface InstructionAccountDerivationItemView {
	id: string;
	name: string | null;
	bumpPath: {
		reference: string;
		path: string;
	} | null;
	seedPaths: string[];
	isUpdating: boolean;
}

export interface InstructionAccountCloseItemView {
	id: string;
	close: string | null;
	isUpdating: boolean;
}

export interface InstructionRelationItemView {
	id: string;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	instructionId: string;
	applicationId: string;
	workspaceId: string;
	to: string;
	from: string;
}

export interface InstructionAccountConstraintItemView {
	id: string;
	accountId: string;
	instructionId: string;
	applicationId: string;
	workspaceId: string;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	name: string;
	body: string;
}
