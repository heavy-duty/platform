import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { DeleteInstructionArgumentParams } from './types';

export const deleteInstructionArgument = (
  params: DeleteInstructionArgumentParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionArgument({
    accounts: {
      argument: new PublicKey(params.instructionArgumentId),
      instruction: new PublicKey(params.instructionId),
      authority: new PublicKey(params.authority),
    },
  });
};
