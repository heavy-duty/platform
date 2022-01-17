import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../utils';

export const createDeleteInstructionRelationInstruction = (
  authority: PublicKey,
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey,
  instructionRelationPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionRelation({
    accounts: {
      relation: instructionRelationPublicKey,
      from: fromPublicKey,
      to: toPublicKey,
      authority: authority,
    },
  });
};
