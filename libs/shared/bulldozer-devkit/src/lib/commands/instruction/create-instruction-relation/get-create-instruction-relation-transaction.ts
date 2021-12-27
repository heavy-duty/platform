import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getCreateInstructionRelationInstruction } from '.';
import { createTransaction } from '../../../operations';
import { addInstructionToTransaction } from '../../../operators';

export const getCreateInstructionRelationTransaction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
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
      getCreateInstructionRelationInstruction(
        authority,
        program,
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
