import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createCreateInstructionRelationInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const createCreateInstructionRelationTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  instructionRelationPublicKey: PublicKey,
  instructionRelationBump: number,
  fromAccount: PublicKey,
  toAccount: PublicKey
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createCreateInstructionRelationInstruction(
        authority,
        workspacePublicKey,
        applicationPublicKey,
        instructionPublicKey,
        instructionRelationPublicKey,
        instructionRelationBump,
        fromAccount,
        toAccount
      )
    )
  );
};
