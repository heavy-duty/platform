import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { CreateInstructionArgumentParams } from './types';

export const createInstructionArgument = (
  params: CreateInstructionArgumentParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstructionArgument(
    params.instructionArgumentDto,
    {
      accounts: {
        argument: new PublicKey(params.instructionArgumentId),
        workspace: new PublicKey(params.workspaceId),
        instruction: new PublicKey(params.instructionId),
        application: new PublicKey(params.applicationId),
        authority: new PublicKey(params.authority),
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
