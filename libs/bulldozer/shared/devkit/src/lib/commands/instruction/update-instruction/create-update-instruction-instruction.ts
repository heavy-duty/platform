import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../utils';

export const createUpdateInstructionInstruction = (
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionName: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstruction(
    { name: instructionName },
    {
      accounts: {
        instruction: instructionPublicKey,
        authority: authority,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
