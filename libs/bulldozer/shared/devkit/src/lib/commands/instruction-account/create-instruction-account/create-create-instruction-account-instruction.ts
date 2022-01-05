import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import { InstructionAccountDto } from '../../../utils';

export const createCreateInstructionAccountInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  instructionAccountPublicKey: PublicKey,
  instructionAccountDto: InstructionAccountDto
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
        instructionAccountDto.collection &&
          instructionAccountDto.kind === 0 && {
            pubkey: new PublicKey(instructionAccountDto.collection),
            isWritable: false,
            isSigner: false,
          },
        instructionAccountDto.payer &&
          instructionAccountDto.kind === 0 && {
            pubkey: new PublicKey(instructionAccountDto.payer),
            isWritable: false,
            isSigner: false,
          },
        instructionAccountDto.close &&
          instructionAccountDto.kind === 0 &&
          instructionAccountDto.modifier === 1 && {
            pubkey: new PublicKey(instructionAccountDto.close),
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
