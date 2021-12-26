import { Program } from '@project-serum/anchor';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { InstructionAccountDto, InstructionAccountExtras } from '../../utils';

export const createInstructionAccountInstruction = (
  authority: PublicKey,
  program: Program,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  instructionAccountPublicKey: PublicKey,
  instructionAccount: InstructionAccountDto,
  instructionAccountExtras: InstructionAccountExtras
): TransactionInstruction => {
  return program.instruction.createInstructionAccount(instructionAccount, {
    accounts: {
      authority: authority,
      workspace: workspacePublicKey,
      application: applicationPublicKey,
      instruction: instructionPublicKey,
      account: instructionAccountPublicKey,
      systemProgram: SystemProgram.programId,
    },
    remainingAccounts: [
      instructionAccountExtras.collection &&
        instructionAccount.kind === 0 && {
          pubkey: new PublicKey(instructionAccountExtras.collection),
          isWritable: false,
          isSigner: false,
        },
      instructionAccountExtras.payer &&
        instructionAccount.kind === 0 && {
          pubkey: new PublicKey(instructionAccountExtras.payer),
          isWritable: false,
          isSigner: false,
        },
      instructionAccountExtras.close &&
        instructionAccount.kind === 0 &&
        instructionAccount.modifier === 1 && {
          pubkey: new PublicKey(instructionAccountExtras.close),
          isWritable: false,
          isSigner: false,
        },
    ].filter(
      <T>(account: T | '' | false | null): account is T =>
        account !== null && account !== false && account !== ''
    ),
  });
};
