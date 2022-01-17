import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../utils';

export const createUpdateInstructionBodyInstruction = (
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionBody: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionBody(
    { body: instructionBody },
    {
      accounts: {
        instruction: instructionPublicKey,
        authority: authority,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
