import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { UpdateInstructionParams } from './types';

export const updateInstruction = (
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
