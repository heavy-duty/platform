import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getCreateCollectionInstruction } from '.';
import { createTransaction } from '../../../operations';
import {
  addInstructionToTransaction,
  partialSignTransaction,
} from '../../../operators';

export const getCreateCollectionTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  collectionKeypair: Keypair,
  collectionName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getCreateCollectionInstruction(
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
