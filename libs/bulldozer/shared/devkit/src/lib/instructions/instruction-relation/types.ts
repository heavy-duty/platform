export interface CreateInstructionRelationParams {
  workspaceId: string;
  authority: string;
  applicationId: string;
  instructionId: string;
  instructionRelationId: string;
  instructionRelationBump: number;
  fromAccountId: string;
  toAccountId: string;
}

export interface UpdateInstructionRelationParams {
  authority: string;
  instructionRelationId: string;
  fromAccountId: string;
  toAccountId: string;
}

export interface DeleteInstructionRelationParams {
  authority: string;
  fromAccountId: string;
  toAccountId: string;
  instructionRelationId: string;
}
