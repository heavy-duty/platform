import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { UpdateInstructionBodyParams } from './types';

export const updateInstructionBody = (
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
