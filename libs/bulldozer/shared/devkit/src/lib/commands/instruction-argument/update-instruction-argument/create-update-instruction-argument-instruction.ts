import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import { InstructionArgumentDto } from '../../../utils';

export const createUpdateInstructionArgumentInstruction = (
  authority: PublicKey,
  instructionArgumentPublicKey: PublicKey,
  instructionArgumentDto: InstructionArgumentDto
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionArgument(
    instructionArgumentDto,
    {
      accounts: {
        argument: instructionArgumentPublicKey,
        authority: authority,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
