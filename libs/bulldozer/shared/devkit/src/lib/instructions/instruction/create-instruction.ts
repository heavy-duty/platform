import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { CreateInstructionParams } from './types';

export const createInstruction = (
  params: CreateInstructionParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstruction(
    { name: params.instructionName },
    {
      accounts: {
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
