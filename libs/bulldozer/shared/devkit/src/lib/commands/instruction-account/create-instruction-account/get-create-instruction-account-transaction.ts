import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { getCreateInstructionAccountInstruction } from '.';
import { createTransaction } from '../../../operations';
import {
  addInstructionToTransaction,
  partialSignTransaction,
} from '../../../operators';
import { InstructionAccountDto } from '../../../utils';

export const getCreateInstructionAccountTransaction = (
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
      getCreateInstructionAccountInstruction(
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