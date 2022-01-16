import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import { CollectionAttributeDto } from '../../../utils';

export const createUpdateCollectionAttributeInstruction = (
  authority: PublicKey,
  collectionAttributePublicKey: PublicKey,
  collectionAttributeDto: CollectionAttributeDto
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateCollectionAttribute(
    collectionAttributeDto,
    {
      accounts: {
        attribute: collectionAttributePublicKey,
        authority: authority,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
