import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram, UpdateCollectionParams } from '../../../utils';

export const createUpdateCollectionInstruction = (
  authority: PublicKey,
  collectionPublicKey: PublicKey,
  collectionName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateCollection(
    { name: collectionName },
    {
      accounts: {
        collection: collectionPublicKey,
        authority: authority,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};

export const createUpdateCollectionInstruction2 = (
  params: UpdateCollectionParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateCollection(
    { name: params.collectionName },
    {
      accounts: {
        collection: new PublicKey(params.collectionId),
        authority: new PublicKey(params.authority),
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
