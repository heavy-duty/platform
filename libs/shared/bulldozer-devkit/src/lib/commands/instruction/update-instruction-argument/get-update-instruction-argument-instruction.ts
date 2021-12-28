import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import { InstructionArgumentDto } from '../../../utils';

export const getUpdateInstructionArgumentInstruction = (
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
      },
    }
  );
};
