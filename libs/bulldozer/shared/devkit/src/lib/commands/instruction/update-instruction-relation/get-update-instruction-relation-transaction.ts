import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getUpdateInstructionRelationInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const getUpdateInstructionRelationTransaction = (
  connection: Connection,
  authority: PublicKey,
  instructionRelationPublicKey: PublicKey,
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getUpdateInstructionRelationInstruction(
        authority,
        instructionRelationPublicKey,
        fromPublicKey,
        toPublicKey
      )
    )
  );
};
