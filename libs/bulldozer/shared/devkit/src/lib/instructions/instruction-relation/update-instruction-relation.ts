import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { UpdateInstructionRelationParams } from './types';

export const updateInstructionRelation = (
  params: UpdateInstructionRelationParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionRelation({
    accounts: {
      relation: new PublicKey(params.instructionRelationId),
      from: new PublicKey(params.fromAccountId),
      to: new PublicKey(params.toAccountId),
      authority: new PublicKey(params.authority),
      clock: SYSVAR_CLOCK_PUBKEY,
    },
  });
};
