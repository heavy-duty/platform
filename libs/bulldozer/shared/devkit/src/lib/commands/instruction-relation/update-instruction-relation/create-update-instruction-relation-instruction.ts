import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  bulldozerProgram,
  UpdateInstructionRelationParams,
} from '../../../utils';

export const createUpdateInstructionRelationInstruction = (
  authority: PublicKey,
  instructionRelationPublicKey: PublicKey,
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionRelation({
    accounts: {
      relation: instructionRelationPublicKey,
      from: fromPublicKey,
      to: toPublicKey,
      authority,
      clock: SYSVAR_CLOCK_PUBKEY,
    },
  });
};

export const createUpdateInstructionRelationInstruction2 = (
  params: UpdateInstructionRelationParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionRelation({
    accounts: {
      relation: new PublicKey(params.instructionRelationId),
      from: new PublicKey(params.fromAccountId),
      to: new PublicKey(params.toAccountId),
      authority: new PublicKey(params.authority),
      clock: SYSVAR_CLOCK_PUBKEY,
    },
  });
};
