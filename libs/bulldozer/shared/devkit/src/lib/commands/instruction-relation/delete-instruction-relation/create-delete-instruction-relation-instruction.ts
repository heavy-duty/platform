import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import {
  bulldozerProgram,
  DeleteInstructionRelationParams,
} from '../../../utils';

export const createDeleteInstructionRelationInstruction = (
  authority: PublicKey,
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey,
  instructionRelationPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionRelation({
    accounts: {
      relation: instructionRelationPublicKey,
      from: fromPublicKey,
      to: toPublicKey,
      authority: authority,
    },
  });
};

export const createDeleteInstructionRelationInstruction2 = (
  params: DeleteInstructionRelationParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.deleteInstructionRelation({
    accounts: {
      relation: new PublicKey(params.instructionRelationId),
      from: new PublicKey(params.fromAccountId),
      to: new PublicKey(params.toAccountId),
      authority: new PublicKey(params.authority),
    },
  });
};
