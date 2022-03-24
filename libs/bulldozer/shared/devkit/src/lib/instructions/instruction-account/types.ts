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
  instructionAccountId: string;
  instructionAccountDto: InstructionAccountDto;
}

export interface DeleteInstructionAccountParams {
  authority: string;
  workspaceId: string;
  instructionId: string;
  instructionAccountId: string;
}
