import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createCreateCollectionInstruction } from '.';
import { createTransaction } from '../../../operations';
import {
  addInstructionToTransaction,
  partialSignTransaction,
} from '../../../operators';

export const createCreateCollectionTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionKeypair: Keypair,
  collectionName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createCreateCollectionInstruction(
        authority,
        workspacePublicKey,
        applicationPublicKey,
        collectionKeypair.publicKey,
        collectionName
      )
    ),
    partialSignTransaction(collectionKeypair)
  );
};
