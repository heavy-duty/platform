import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const deleteInstructionRelationInstruction = (
  authority: PublicKey,
  program: Program,
  instructionRelationPublicKey: PublicKey
): TransactionInstruction => {
  return program.instruction.deleteInstructionRelation({
    accounts: {
      relation: instructionRelationPublicKey,
      authority: authority,
    },
  });
};
