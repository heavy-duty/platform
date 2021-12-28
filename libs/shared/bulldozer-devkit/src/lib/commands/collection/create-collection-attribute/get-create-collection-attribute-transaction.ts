import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getCreateCollectionAttributeInstruction } from '.';
import { createTransaction } from '../../../operations';
import {
  addInstructionToTransaction,
  partialSignTransaction,
} from '../../../operators';
import { CollectionAttributeDto } from '../../../utils';

export const getCreateCollectionAttributeTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionPublicKey: PublicKey,
  collectionAttributeKeypair: Keypair,
  collectionAttributeDto: CollectionAttributeDto
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getCreateCollectionAttributeInstruction(
        authority,
        workspacePublicKey,
        applicationPublicKey,
        collectionPublicKey,
        collectionAttributeKeypair.publicKey,
        collectionAttributeDto
      )
    ),
    partialSignTransaction(collectionAttributeKeypair)
  );
};
