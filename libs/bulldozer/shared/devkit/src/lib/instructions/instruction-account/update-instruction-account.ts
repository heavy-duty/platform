import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { UpdateInstructionAccountParams } from './types';

export const updateInstructionAccount = (
  params: UpdateInstructionAccountParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionAccount(
    params.instructionAccountDto,
    {
      accounts: {
        authority: new PublicKey(params.authority),
        account: new PublicKey(params.instructionAccountId),
        clock: SYSVAR_CLOCK_PUBKEY,
      },
      remainingAccounts: [
        params.instructionAccountDto.collection &&
          params.instructionAccountDto.kind === 0 && {
            pubkey: new PublicKey(params.instructionAccountDto.collection),
            isWritable: false,
            isSigner: false,
          },
        params.instructionAccountDto.payer &&
          params.instructionAccountDto.modifier === 0 && {
            pubkey: new PublicKey(params.instructionAccountDto.payer),
            isWritable: false,
            isSigner: false,
          },
        params.instructionAccountDto.close &&
          params.instructionAccountDto.modifier === 1 && {
            pubkey: new PublicKey(params.instructionAccountDto.close),
            isWritable: false,
            isSigner: false,
          },
      ].filter(
        <T>(account: T | '' | false | null): account is T =>
          account !== null && account !== false && account !== ''
      ),
    }
  );
};
