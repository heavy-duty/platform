import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createInstructionInstruction } from './create-instruction.instruction';

export const createInstruction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionName: string
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return from(
    defer(() => connection.getRecentBlockhash(connection.commitment))
  ).pipe(
    map(({ blockhash }) => {
      const instruction = Keypair.generate();
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authority,
      }).add(
        createInstructionInstruction(
          authority,
          program,
          workspacePublicKey,
          applicationPublicKey,
          instruction.publicKey,
          instructionName
        )
      );
      transaction.partialSign(instruction);

      return { transaction, signers: [instruction] };
    })
  );
};
