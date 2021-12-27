import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getUpdateApplicationInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const getUpdateApplicationTransaction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  applicationPublicKey: PublicKey,
  applicationName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getUpdateApplicationInstruction(
        authority,
        program,
        applicationPublicKey,
        applicationName
      )
    )
  );
};
