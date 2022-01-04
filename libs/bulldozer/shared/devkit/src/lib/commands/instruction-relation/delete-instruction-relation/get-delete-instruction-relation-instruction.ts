import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getDeleteInstructionRelationInstruction = (
  authority: PublicKey,
  instructionRelationPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionRelation({
    accounts: {
      relation: instructionRelationPublicKey,
      authority: authority,
    },
  });
};
