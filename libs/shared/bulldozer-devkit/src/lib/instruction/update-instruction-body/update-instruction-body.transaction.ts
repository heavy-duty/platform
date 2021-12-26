import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { updateInstructionBodyInstruction } from './update-instruction-body.instruction';

export const updateInstructionBody = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  instructionPublicKey: PublicKey,
  instructionBody: string
): Observable<{ transaction: Transaction }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      transaction.add(
        updateInstructionBodyInstruction(
          authority,
          program,
          instructionPublicKey,
          instructionBody
        )
      );

      return { transaction };
    })
  );
};
