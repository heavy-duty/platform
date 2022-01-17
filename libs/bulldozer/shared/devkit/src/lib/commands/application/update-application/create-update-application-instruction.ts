import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../utils';

export const createUpdateApplicationInstruction = (
  authority: PublicKey,
  applicationPublicKey: PublicKey,
  applicationName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateApplication(
    { name: applicationName },
    {
      accounts: {
        application: applicationPublicKey,
        authority: authority,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
