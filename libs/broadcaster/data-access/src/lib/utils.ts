import { instructionCoder } from '@heavy-duty/bulldozer-devkit';
import {
  CompiledInstruction,
  Finality,
  Message,
  TransactionResponse,
  TransactionSignature,
} from '@solana/web3.js';

export interface TransactionStatus {
  signature: TransactionSignature;
  status: Finality;
  transactionResponse: TransactionResponse;
  timestamp: number;
}

export interface InstructionStatus {
  transactionStatus: TransactionStatus;
  instruction: CompiledInstruction;
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
  const transactionResponse = transactionStatus.transactionResponse;

  const transactionMessage = new Message({
    header: transactionResponse.transaction.message.header,
    accountKeys: transactionResponse.transaction.message
      .accountKeys as unknown as string[],
    recentBlockhash: transactionResponse.transaction.message.recentBlockhash,
    instructions: transactionResponse.transaction.message.instructions,
  });

  return transactionMessage.instructions
    .map((instruction) => {
      const decodedInstruction = instructionCoder.decode(
        instruction.data,
        'base58'
      );

      if (decodedInstruction === null) {
        return null;
      }

      const instructionAccountMetas = instruction.accounts.map(
        (accountIndex) => ({
          pubkey: transactionMessage.accountKeys[accountIndex],
          isWritable: transactionMessage.isAccountWritable(accountIndex),
          isSigner: transactionMessage.isAccountSigner(accountIndex),
        })
      );

      const decodedAndFormattedInstruction = instructionCoder.format(
        decodedInstruction,
        instructionAccountMetas
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
          pubkey: account.pubkey.toBase58(),
        })),
      };
    })
    .filter(
      (instructionStatus): instructionStatus is InstructionStatus =>
        instructionStatus !== null
    );
};
