import { InstructionArgumentDto } from '../../utils';

export interface CreateInstructionArgumentParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  instructionId: string;
  instructionArgumentId: string;
  instructionArgumentDto: InstructionArgumentDto;
}

export interface UpdateInstructionArgumentParams {
  authority: string;
  instructionArgumentId: string;
  instructionArgumentDto: InstructionArgumentDto;
}

export interface DeleteInstructionArgumentParams {
  authority: string;
  instructionId: string;
  instructionArgumentId: string;
}
