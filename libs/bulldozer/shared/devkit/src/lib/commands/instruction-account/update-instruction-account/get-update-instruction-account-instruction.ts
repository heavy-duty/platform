import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import { InstructionAccountDto } from '../../../utils';

export const getUpdateInstructionAccountInstruction = (
  authority: PublicKey,
  instructionAccountPublicKey: PublicKey,
  instructionAccountDto: InstructionAccountDto
): TransactionInstruction => {
  return bulldozerProgram.instruction.updateInstructionAccount(
    instructionAccountDto,
    {
      accounts: {
        authority,
        account: instructionAccountPublicKey,
      },
      remainingAccounts: [
        instructionAccountDto.collection &&
          instructionAccountDto.kind === 0 && {
            pubkey: new PublicKey(instructionAccountDto.collection),
            isWritable: false,
            isSigner: false,
          },
        instructionAccountDto.payer &&
          instructionAccountDto.modifier === 0 && {
            pubkey: new PublicKey(instructionAccountDto.payer),
            isWritable: false,
            isSigner: false,
          },
        instructionAccountDto.close &&
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
