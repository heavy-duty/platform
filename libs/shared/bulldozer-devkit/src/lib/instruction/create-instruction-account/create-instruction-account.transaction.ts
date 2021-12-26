import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createTransaction } from '../../operations';
import { InstructionAccountDto, InstructionAccountExtras } from '../../utils';
import { createInstructionAccountInstruction } from './create-instruction-account.instruction';

export const createInstructionAccount = (
  connection: Connection,
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  instructionAccountDto: InstructionAccountDto,
  instructionAccountExtras: InstructionAccountExtras
): Observable<{ transaction: Transaction; signers: Keypair[] }> => {
  return createTransaction(connection, authority).pipe(
    map((transaction) => {
      const instructionAccount = Keypair.generate();
      transaction.add(
        createInstructionAccountInstruction(
          authority,
          program,
          workspacePublicKey,
          applicationPublicKey,
          instructionPublicKey,
          instructionAccount.publicKey,
          instructionAccountDto,
          instructionAccountExtras
        )
      );
      transaction.partialSign(instructionAccount);

      return { transaction, signers: [instructionAccount] };
    })
  );
};
