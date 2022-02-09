import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { DeleteInstructionParams } from './types';

export const deleteInstruction = (
  params: DeleteInstructionParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstruction({
    accounts: {
      application: new PublicKey(params.applicationId),
      instruction: new PublicKey(params.instructionId),
      authority: new PublicKey(params.authority),
    },
  });
};
