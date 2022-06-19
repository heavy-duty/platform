export interface CreateInstructionAccountConstraintParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	instructionAccountId: string;
	instructionAccountConstraintId: string;
	name: string;
	body: string;
}

export interface UpdateInstructionAccountConstraintParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	instructionAccountId: string;
	instructionAccountConstraintId: string;
	name: string;
	body: string;
}

export interface DeleteInstructionAccountConstraintParams {
	authority: string;
	workspaceId: string;
	applicationId: string;
	instructionId: string;
	instructionAccountId: string;
	instructionAccountConstraintId: string;
}
