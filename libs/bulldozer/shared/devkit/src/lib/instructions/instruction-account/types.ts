import { InstructionAccountDto } from '../../utils';

export interface CreateInstructionAccountParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	instructionAccountId: string;
	instructionAccountDto: InstructionAccountDto;
}

export interface UpdateInstructionAccountParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	instructionAccountId: string;
	instructionAccountDto: InstructionAccountDto;
}

export interface SetInstructionAccountCollectionParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	collectionId: string;
	instructionId: string;
	instructionAccountId: string;
}

export interface SetInstructionAccountCloseParams {
	authority: string;
	workspaceId: string;
	instructionId: string;
	instructionAccountId: string;
	close: string;
}

export interface ClearInstructionAccountCloseParams {
	authority: string;
	workspaceId: string;
	instructionId: string;
	instructionAccountId: string;
}

export interface ClearInstructionAccountDerivationParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	instructionAccountId: string;
}

export interface SetInstructionAccountPayerParams {
	authority: string;
	workspaceId: string;
	instructionId: string;
	instructionAccountId: string;
	payer: string;
}

export interface DeleteInstructionAccountParams {
	authority: string;
	workspaceId: string;
	instructionId: string;
	instructionAccountId: string;
}

export interface AddSeedToDerivationParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	instructionAccountId: string;
	referenceId: string;
}

export interface SetBumpToDerivationParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	instructionAccountId: string;
	collectionId: string;
	referenceId: string;
	pathId: string;
}

export interface SetTokenConfigurationParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	instructionAccountId: string;
	mint: string;
	tokenAuthority: string;
}

export interface SetInstructionAccountDerivationParams {
	name: string | null;
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	instructionAccountId: string;
}
