import { Program } from '@project-serum/anchor';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';

export const getCreateApplicationInstruction = (
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  applicationName: string
): TransactionInstruction => {
  return program.instruction.createApplication(applicationName, {
    accounts: {
      workspace: workspacePublicKey,
      application: applicationPublicKey,
      authority: authority,
      systemProgram: SystemProgram.programId,
    },
  });
};
