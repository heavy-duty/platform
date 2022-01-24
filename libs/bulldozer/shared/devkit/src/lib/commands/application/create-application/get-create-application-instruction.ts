import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const getCreateApplicationInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  applicationName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.createApplication(applicationName, {
    accounts: {
      workspace: workspacePublicKey,
      application: applicationPublicKey,
      authority: authority,
      systemProgram: SystemProgram.programId,
    },
  });
};
