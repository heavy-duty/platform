import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram, UpdateApplicationParams } from '../../../utils';

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

export const createUpdateApplicationInstruction2 = (
  params: UpdateApplicationParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateApplication(
    { name: params.applicationName },
    {
      accounts: {
        application: new PublicKey(params.applicationId),
        authority: new PublicKey(params.authority),
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
