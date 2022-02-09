export interface CreateInstructionParams {
  workspaceId: string;
  authority: string;
  applicationId: string;
  instructionId: string;
  instructionName: string;
}

export interface UpdateInstructionParams {
  authority: string;
  instructionId: string;
  instructionName: string;
}

export interface UpdateInstructionBodyParams {
  authority: string;
  instructionId: string;
  instructionBody: string;
}

export interface DeleteInstructionParams {
  authority: string;
  applicationId: string;
  instructionId: string;
}
