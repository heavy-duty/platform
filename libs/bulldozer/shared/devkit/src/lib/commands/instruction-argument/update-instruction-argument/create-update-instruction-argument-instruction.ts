import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  bulldozerProgram,
  InstructionArgumentDto,
  UpdateInstructionArgumentParams,
} from '../../../utils';

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

export const createUpdateInstructionArgumentInstruction2 = (
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
