import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { UpdateInstructionArgumentParams } from './types';

export const updateInstructionArgument = (
  params: UpdateInstructionArgumentParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionArgument(
    params.instructionArgumentDto,
    {
      accounts: {
        argument: new PublicKey(params.instructionArgumentId),
        authority: new PublicKey(params.authority),
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
