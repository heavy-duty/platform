import {
  addInstructionToTransaction,
  createTransaction,
  partialSignTransaction,
} from '@heavy-duty/rx-solana';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createCreateCollectionInstruction } from '.';

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
