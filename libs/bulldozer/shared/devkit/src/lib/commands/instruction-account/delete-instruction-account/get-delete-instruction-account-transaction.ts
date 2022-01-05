import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getDeleteInstructionAccountInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const getDeleteInstructionAccountTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionAccountPublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getDeleteInstructionAccountInstruction(
        authority,
        instructionPublicKey,
        instructionAccountPublicKey
      )
    )
  );
};
