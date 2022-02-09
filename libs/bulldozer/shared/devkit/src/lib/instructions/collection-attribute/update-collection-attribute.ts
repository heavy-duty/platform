import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { UpdateCollectionAttributeParams } from './types';

export const updateCollectionAttribute = (
  params: UpdateCollectionAttributeParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateCollectionAttribute(
    params.collectionAttributeDto,
    {
      accounts: {
        attribute: new PublicKey(params.collectionAttributeId),
        authority: new PublicKey(params.authority),
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
