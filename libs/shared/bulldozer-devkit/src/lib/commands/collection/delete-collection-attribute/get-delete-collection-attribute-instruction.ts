import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const getDeleteCollectionAttributeInstruction = (
  authority: PublicKey,
  program: Program,
  collectionAttributePublicKey: PublicKey
): TransactionInstruction => {
  return program.instruction.deleteCollectionAttribute({
    accounts: {
      attribute: collectionAttributePublicKey,
      authority: authority,
    },
  });
};
