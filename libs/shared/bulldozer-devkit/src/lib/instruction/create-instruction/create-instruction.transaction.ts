import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { createInstructionInstruction } from './create-instruction.instruction';

export const createInstruction = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionName: string
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      const instruction = Keypair.generate();
      transaction.add(
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
