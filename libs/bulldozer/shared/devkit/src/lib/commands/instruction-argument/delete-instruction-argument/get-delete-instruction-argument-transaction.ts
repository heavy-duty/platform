import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteInstructionArgumentInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const getDeleteInstructionArgumentTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionArgumentPublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getDeleteInstructionArgumentInstruction(
        authority,
        instructionPublicKey,
        instructionArgumentPublicKey
      )
    )
  );
};
