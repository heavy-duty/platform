import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { updateInstructionBodyInstruction } from './update-instruction-body.instruction';

export const updateInstructionBody = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  instructionPublicKey: PublicKey,
  instructionBody: string
): Observable<{ transaction: Transaction }> => {
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(({ blockhash }) => {
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authority,
      }).add(
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
