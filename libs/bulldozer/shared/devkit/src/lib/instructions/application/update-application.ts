import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { UpdateApplicationParams } from './types';

export const updateApplication = (
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
