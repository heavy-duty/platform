import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../utils';

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