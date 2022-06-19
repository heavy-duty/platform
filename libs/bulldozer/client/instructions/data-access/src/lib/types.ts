import { List } from 'immutable';

export interface ItemView<T> {
	document: T;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
}

export interface UpdateDerivationParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	instructionAccountId: string;
	name: string | null;
	seedPaths: List<string>;
	bumpPath: {
		referenceId: string;
		pathId: string;
		collectionId: string;
	} | null;
}

export interface UpdateInstructionBodyParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	body: string;
}
