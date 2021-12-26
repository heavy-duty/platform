import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { updateInstructionInstruction } from '../instructions';

export const updateInstruction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  instructionPublicKey: PublicKey,
  instructionName: string
): Observable<{ transaction: Transaction }> => {
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(({ blockhash }) => {
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authority,
      }).add(
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
