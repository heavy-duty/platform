import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

export const createCreateApplicationInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  applicationName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.createApplication(
    { name: applicationName },
    {
      accounts: {
        workspace: workspacePublicKey,
        application: applicationPublicKey,
        authority: authority,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
