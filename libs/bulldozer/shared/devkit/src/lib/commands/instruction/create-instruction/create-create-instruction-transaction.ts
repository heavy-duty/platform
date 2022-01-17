import {
  addInstructionToTransaction,
  createTransaction,
  partialSignTransaction,
} from '@heavy-duty/rx-solana';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createCreateInstructionInstruction } from '.';

export const createCreateInstructionTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionKeypair: Keypair,
  instructionName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createCreateInstructionInstruction(
        authority,
        workspacePublicKey,
        applicationPublicKey,
        instructionKeypair.publicKey,
        instructionName
      )
    ),
    partialSignTransaction(instructionKeypair)
  );
};
