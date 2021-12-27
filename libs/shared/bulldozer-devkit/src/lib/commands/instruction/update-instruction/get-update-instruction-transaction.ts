import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getUpdateInstructionInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const getUpdateInstructionTransaction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  instructionPublicKey: PublicKey,
  instructionName: string
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      getUpdateInstructionInstruction(
        authority,
        program,
        instructionPublicKey,
        instructionName
      )
    )
  );
};
