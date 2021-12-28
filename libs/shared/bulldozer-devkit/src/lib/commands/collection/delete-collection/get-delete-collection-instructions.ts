import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { getDeleteCollectionInstruction } from '.';
import { getDeleteCollectionAttributeInstruction } from '..';

export const getDeleteCollectionInstructions = (
  authority: PublicKey,
  collectionPublicKey: PublicKey,
  collectionAttributePublicKeys: PublicKey[]
): TransactionInstruction[] => [
  getDeleteCollectionInstruction(authority, collectionPublicKey),
  ...collectionAttributePublicKeys.map((collectionAttributePublicKey) =>
    getDeleteCollectionAttributeInstruction(
      authority,
      collectionAttributePublicKey
    )
  ),
];
