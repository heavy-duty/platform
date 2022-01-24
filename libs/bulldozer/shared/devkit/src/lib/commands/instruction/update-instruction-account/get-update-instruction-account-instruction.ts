import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import {
  InstructionAccountDto,
  InstructionAccountExtras,
} from '../../../utils';

export const getUpdateInstructionAccountInstruction = (
  authority: PublicKey,
  instructionAccountPublicKey: PublicKey,
  instructionAccountDto: InstructionAccountDto,
  instructionAccountExtras: InstructionAccountExtras
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionAccount(
    instructionAccountDto,
    {
      accounts: {
        authority,
        account: instructionAccountPublicKey,
      },
      remainingAccounts: [
        instructionAccountExtras.collection &&
          instructionAccountDto.kind === 0 && {
            pubkey: new PublicKey(instructionAccountExtras.collection),
            isWritable: false,
            isSigner: false,
          },
        instructionAccountExtras.payer &&
          instructionAccountDto.modifier === 0 && {
            pubkey: new PublicKey(instructionAccountExtras.payer),
            isWritable: false,
            isSigner: false,
          },
        instructionAccountExtras.close &&
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
