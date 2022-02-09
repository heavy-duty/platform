import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { UpdateCollectionParams } from './types';

export const updateCollection = (
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
