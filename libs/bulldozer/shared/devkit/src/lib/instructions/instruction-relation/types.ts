export interface CreateInstructionRelationParams {
  authority: string;
  workspaceId: string;
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
