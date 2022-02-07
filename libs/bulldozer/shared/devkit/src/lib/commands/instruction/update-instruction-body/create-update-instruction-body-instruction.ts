import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram, UpdateInstructionBodyParams } from '../../../utils';

export const createUpdateInstructionBodyInstruction = (
  authority: PublicKey,
  instructionPublicKey: PublicKey,
  instructionBody: string
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionBody(
    { body: instructionBody },
    {
      accounts: {
        instruction: instructionPublicKey,
        authority: authority,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};

export const createUpdateInstructionBodyInstruction2 = (
  params: UpdateInstructionBodyParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionBody(
    { body: params.instructionBody },
    {
      accounts: {
        instruction: new PublicKey(params.instructionId),
        authority: new PublicKey(params.authority),
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
