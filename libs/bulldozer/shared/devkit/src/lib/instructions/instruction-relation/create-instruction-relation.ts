import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { CreateInstructionRelationParams } from './types';

export const createInstructionRelation = (
  params: CreateInstructionRelationParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstructionRelation(
    { bump: params.instructionRelationBump },
    {
      accounts: {
        relation: new PublicKey(params.instructionRelationId),
        workspace: new PublicKey(params.workspaceId),
        instruction: new PublicKey(params.instructionId),
        application: new PublicKey(params.applicationId),
        from: new PublicKey(params.fromAccountId),
        to: new PublicKey(params.toAccountId),
        authority: new PublicKey(params.authority),
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
