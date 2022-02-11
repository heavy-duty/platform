export interface CreateInstructionRelationParams {
  workspaceId: string;
  authority: string;
  applicationId: string;
  instructionId: string;
  fromAccountId: string;
  toAccountId: string;
}

export interface DeleteInstructionRelationParams {
  authority: string;
  fromAccountId: string;
  toAccountId: string;
}
