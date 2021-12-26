import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { InstructionArgumentDto } from '../../utils';

export const updateInstructionArgumentInstruction = (
  authority: PublicKey,
  program: Program,
  instructionArgumentPublicKey: PublicKey,
  instructionArgumentDto: InstructionArgumentDto
): TransactionInstruction => {
  return program.instruction.updateInstructionArgument(instructionArgumentDto, {
    accounts: {
      argument: instructionArgumentPublicKey,
      authority: authority,
    },
  });
};
