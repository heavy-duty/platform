import {
  addInstructionToTransaction,
  createTransaction,
  partialSignTransaction,
} from '@heavy-duty/rx-solana';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { createCreateInstructionAccountInstruction } from '.';
import { InstructionAccountDto } from '../../../utils';

export const createCreateInstructionAccountTransaction = (
  connection: Connection,
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  instructionAccountKeypair: Keypair,
  instructionAccountDto: InstructionAccountDto
): Observable<Transaction> => {
  return createTransaction(connection, authority).pipe(
    addInstructionToTransaction(
      createCreateInstructionAccountInstruction(
        authority,
        workspacePublicKey,
        applicationPublicKey,
        instructionPublicKey,
        instructionAccountKeypair.publicKey,
        instructionAccountDto
      )
    ),
    partialSignTransaction(instructionAccountKeypair)
  );
};
