export interface CreateInstructionParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  instructionId: string;
  instructionName: string;
}

export interface UpdateInstructionParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  instructionId: string;
  instructionName: string;
}

export interface UpdateInstructionBodyParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  instructionId: string;
  instructionBody: string;
}

export interface DeleteInstructionParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  instructionId: string;
}
