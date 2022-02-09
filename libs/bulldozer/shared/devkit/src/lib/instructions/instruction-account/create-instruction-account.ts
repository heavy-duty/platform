import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../programs';
import { CreateInstructionAccountParams } from './types';

export const createInstructionAccount = (
  params: CreateInstructionAccountParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstructionAccount(
    params.instructionAccountDto,
    {
      accounts: {
        authority: new PublicKey(params.authority),
        workspace: new PublicKey(params.workspaceId),
        application: new PublicKey(params.applicationId),
        instruction: new PublicKey(params.instructionId),
        account: new PublicKey(params.instructionAccountId),
        systemProgram: SystemProgram.programId,
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
          params.instructionAccountDto.kind === 0 && {
            pubkey: new PublicKey(params.instructionAccountDto.payer),
            isWritable: false,
            isSigner: false,
          },
        params.instructionAccountDto.close &&
          params.instructionAccountDto.kind === 0 &&
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
