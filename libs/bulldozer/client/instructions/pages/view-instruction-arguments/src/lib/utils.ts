import { TransactionStatus } from '@heavy-duty/broadcaster';
import { instructionCoder } from '@heavy-duty/bulldozer-devkit';
import { TransactionInstruction } from '@solana/web3.js';
import base58 from 'bs58';

export interface InstructionStatus {
  transactionStatus: TransactionStatus;
  instruction: TransactionInstruction;
  title: string;
  name: string;
  accounts: {
    name: string;
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }[];
  data: object;
}

export const flattenInstructions = (
  transactionStatus: TransactionStatus
): InstructionStatus[] => {
  return transactionStatus.transaction.instructions
    .map((instruction) => {
      const decodedInstruction = instructionCoder.decode(
        base58.encode(
          (instruction.data as unknown as { data: Uint8Array }).data
        ),
        'base58'
      );

      if (decodedInstruction === null) {
        return null;
      }

      const decodedAndFormattedInstruction = instructionCoder.format(
        decodedInstruction,
        instruction.keys
      );

      if (decodedAndFormattedInstruction === null) {
        return null;
      }

      return {
        transactionStatus,
        instruction,
        data: decodedInstruction.data,
        name: decodedInstruction.name,
        title: decodedInstruction.name
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, function (str) {
            return str.toUpperCase();
          }),
        accounts: decodedAndFormattedInstruction.accounts.map((account) => ({
          ...account,
          name: account.name ?? 'Unknown',
          pubkey: account.pubkey as unknown as string,
        })),
      };
    })
    .filter(
      (instructionStatus): instructionStatus is InstructionStatus =>
        instructionStatus !== null
    );
};