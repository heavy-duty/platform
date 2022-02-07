import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import {
  bulldozerProgram,
  DeleteInstructionAccountParams,
} from '../../../utils';

export const createDeleteInstructionAccountInstruction = (
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionAccountPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionAccount({
    accounts: {
      instruction: instructionPublicKey,
      account: instructionAccountPublicKey,
      authority: authority,
    },
  });
};

export const createDeleteInstructionAccountInstruction2 = (
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
