import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import {
  bulldozerProgram,
  DeleteInstructionArgumentParams,
} from '../../../utils';

export const createDeleteInstructionArgumentInstruction = (
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionArgumentPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionArgument({
    accounts: {
      instruction: instructionPublicKey,
      argument: instructionArgumentPublicKey,
      authority: authority,
    },
  });
};

export const createDeleteInstructionArgumentInstruction2 = (
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
