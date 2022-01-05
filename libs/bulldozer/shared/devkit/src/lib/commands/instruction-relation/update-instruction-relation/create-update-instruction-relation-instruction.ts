import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const createUpdateInstructionRelationInstruction = (
  authority: PublicKey,
  instructionRelationPublicKey: PublicKey,
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionRelation({
    accounts: {
      relation: instructionRelationPublicKey,
      from: fromPublicKey,
      to: toPublicKey,
      authority,
    },
  });
};
