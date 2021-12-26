import { Program } from '@project-serum/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { InstructionAccountDto, InstructionAccountExtras } from '../../utils';

export const updateInstructionAccountInstruction = (
  authority: PublicKey,
  program: Program,
  instructionAccountPublicKey: PublicKey,
  instructionAccountDto: InstructionAccountDto,
  instructionAccountExtras: InstructionAccountExtras
): TransactionInstruction => {
  return program.instruction.updateInstructionAccount(
    instructionAccountPublicKey,
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
