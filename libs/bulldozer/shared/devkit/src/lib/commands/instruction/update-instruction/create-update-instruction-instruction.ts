import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram, UpdateInstructionParams } from '../../../utils';

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

export const createUpdateInstructionInstruction2 = (
  params: UpdateInstructionParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstruction(
    { name: params.instructionName },
    {
      accounts: {
        instruction: new PublicKey(params.instructionId),
        authority: new PublicKey(params.authority),
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
