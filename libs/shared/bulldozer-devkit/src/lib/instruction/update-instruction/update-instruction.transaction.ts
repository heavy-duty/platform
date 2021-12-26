import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { updateInstructionInstruction } from './update-instruction.instruction';

export const updateInstruction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  instructionPublicKey: PublicKey,
  instructionName: string
): Observable<{ transaction: Transaction }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      transaction.add(
        updateInstructionInstruction(
          authority,
          program,
          instructionPublicKey,
          instructionName
        )
      );

      return { transaction };
    })
  );
};
