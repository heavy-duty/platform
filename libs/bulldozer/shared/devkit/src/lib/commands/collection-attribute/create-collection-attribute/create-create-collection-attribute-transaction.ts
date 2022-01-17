import {
  addInstructionToTransaction,
  createTransaction,
  partialSignTransaction,
} from '@heavy-duty/rx-solana';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createCreateCollectionAttributeInstruction } from '.';
import { CollectionAttributeDto } from '../../../utils';

export const createCreateCollectionAttributeTransaction = (
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
      createCreateCollectionAttributeInstruction(
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
