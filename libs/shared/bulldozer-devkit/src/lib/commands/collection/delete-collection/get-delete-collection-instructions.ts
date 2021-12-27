import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { getDeleteCollectionInstruction } from '.';
import { getDeleteCollectionAttributeInstruction } from '..';

export const getDeleteCollectionInstructions = (
  authority: PublicKey,
  program: Program,
  collectionPublicKey: PublicKey,
  collectionAttributePublicKeys: PublicKey[]
): TransactionInstruction[] => [
  getDeleteCollectionInstruction(authority, program, collectionPublicKey),
  ...collectionAttributePublicKeys.map((collectionAttributePublicKey) =>
    getDeleteCollectionAttributeInstruction(
      authority,
      program,
      collectionAttributePublicKey
    )
  ),
];
