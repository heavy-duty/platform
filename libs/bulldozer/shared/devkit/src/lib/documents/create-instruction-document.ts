import { AccountInfo } from '@solana/web3.js';
import { bulldozerProgram } from '../programs';
import { Document, Instruction, INSTRUCTION_ACCOUNT_NAME } from '../utils';

export const createInstructionDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<Instruction> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    INSTRUCTION_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    name: decodedAccount.name,
    data: {
      body: decodedAccount.body,
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
