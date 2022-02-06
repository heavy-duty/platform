import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  bulldozerProgram,
  CollectionAttributeDto,
  UpdateCollectionAttributeParams,
} from '../../../utils';

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

export const createUpdateCollectionAttributeInstruction2 = (
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
