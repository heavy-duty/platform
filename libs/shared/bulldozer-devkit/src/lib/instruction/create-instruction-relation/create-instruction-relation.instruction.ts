import { Program } from '@project-serum/anchor';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';

export const createInstructionRelationInstruction = (
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  relationPublicKey: PublicKey,
  relationBump: number,
  fromAccount: PublicKey,
  toAccount: PublicKey
): TransactionInstruction => {
  return program.instruction.createInstructionRelation(relationBump, {
    accounts: {
      relation: relationPublicKey,
      workspace: workspacePublicKey,
      instruction: instructionPublicKey,
      application: applicationPublicKey,
      from: new PublicKey(fromAccount),
      to: new PublicKey(toAccount),
      authority,
      systemProgram: SystemProgram.programId,
    },
  });
};
