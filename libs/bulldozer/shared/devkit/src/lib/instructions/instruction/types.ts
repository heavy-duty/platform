import { InstructionBodyDto, InstructionDto } from '../../utils';

export interface CreateInstructionParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  instructionId: string;
  instructionDto: InstructionDto;
}

export interface UpdateInstructionParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  instructionId: string;
  instructionDto: InstructionDto;
}

export interface UpdateInstructionBodyParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  instructionId: string;
  instructionBodyDto: InstructionBodyDto;
}

export interface DeleteInstructionParams {
  authority: string;
  workspaceId: string;
  applicationId: string;
  instructionId: string;
}
