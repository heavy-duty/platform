import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { DeleteInstructionAccountParams } from './types';

export const deleteInstructionAccount = (
  params: DeleteInstructionAccountParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionAccount({
    accounts: {
      instruction: new PublicKey(params.instructionId),
      account: new PublicKey(params.instructionAccountId),
      authority: new PublicKey(params.authority),
    },
  });
};
