import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram, DeleteInstructionParams } from '../../../utils';

export const createDeleteInstructionInstruction = (
  authority: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstruction({
    accounts: {
      instruction: instructionPublicKey,
      application: applicationPublicKey,
      authority: authority,
    },
  });
};

export const createDeleteInstructionInstruction2 = (
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
