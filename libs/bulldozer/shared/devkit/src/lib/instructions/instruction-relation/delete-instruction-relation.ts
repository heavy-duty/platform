import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { DeleteInstructionRelationParams } from './types';

export const deleteInstructionRelation = (
  params: DeleteInstructionRelationParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionRelation({
    accounts: {
      relation: new PublicKey(params.instructionRelationId),
      from: new PublicKey(params.fromAccountId),
      to: new PublicKey(params.toAccountId),
      authority: new PublicKey(params.authority),
    },
  });
};
