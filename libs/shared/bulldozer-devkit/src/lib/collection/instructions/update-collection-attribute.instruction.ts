import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

export const updateCollectionAttributeInstruction = (
  authority: PublicKey,
  program: Program,
  collectionAttributePublicKey: PublicKey,
  collectionAttributeName: string
): TransactionInstruction => {
  return program.instruction.updateCollectionAttribute(
    collectionAttributeName,
    {
      accounts: {
        attribute: collectionAttributePublicKey,
        authority: authority,
      },
    }
  );
};
