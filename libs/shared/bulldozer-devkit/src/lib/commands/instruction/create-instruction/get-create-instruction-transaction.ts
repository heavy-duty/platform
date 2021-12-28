import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getCreateInstructionInstruction } from '.';
import { createTransaction } from '../../../operations';
import {
  addInstructionToTransaction,
  partialSignTransaction,
} from '../../../operators';

export const getCreateInstructionTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionKeypair: Keypair,
  instructionName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getCreateInstructionInstruction(
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
