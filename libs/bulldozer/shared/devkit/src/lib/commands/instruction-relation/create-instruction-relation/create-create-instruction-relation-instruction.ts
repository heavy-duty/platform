import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const createCreateInstructionRelationInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  relationPublicKey: PublicKey,
  relationBump: number,
  fromAccount: PublicKey,
  toAccount: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstructionRelation(relationBump, {
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
