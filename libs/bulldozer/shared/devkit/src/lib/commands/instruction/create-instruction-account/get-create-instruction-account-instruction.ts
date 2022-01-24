import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import {
  InstructionAccountDto,
  InstructionAccountExtras,
} from '../../../utils';

export const getCreateInstructionAccountInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  instructionAccountPublicKey: PublicKey,
  instructionAccountDto: InstructionAccountDto,
  instructionAccountExtras: InstructionAccountExtras
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstructionAccount(
    instructionAccountDto,
    {
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
          instructionAccountDto.kind === 0 && {
            pubkey: new PublicKey(instructionAccountExtras.collection),
            isWritable: false,
            isSigner: false,
          },
        instructionAccountExtras.payer &&
          instructionAccountDto.kind === 0 && {
            pubkey: new PublicKey(instructionAccountExtras.payer),
            isWritable: false,
            isSigner: false,
          },
        instructionAccountExtras.close &&
          instructionAccountDto.kind === 0 &&
          instructionAccountDto.modifier === 1 && {
            pubkey: new PublicKey(instructionAccountExtras.close),
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
