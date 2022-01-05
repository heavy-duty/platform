import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createCreateApplicationInstruction } from '.';
import { createTransaction } from '../../../operations';
import {
  addInstructionToTransaction,
  partialSignTransaction,
} from '../../../operators';

export const createCreateApplicationTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationKeypair: Keypair,
  applicationName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createCreateApplicationInstruction(
        authority,
        workspacePublicKey,
        applicationKeypair.publicKey,
        applicationName
      )
    ),
    partialSignTransaction(applicationKeypair)
  );
};
