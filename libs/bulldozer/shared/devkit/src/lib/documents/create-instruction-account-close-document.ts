import { AccountInfo } from '@solana/web3.js';
import {
  Document,
  InstructionAccountClose,
  INSTRUCTION_ACCOUNT_CLOSE_ACCOUNT_NAME,
} from '../utils';
import { borshCoder } from './internal';

export const createInstructionAccountCloseDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<InstructionAccountClose> => {
  const decodedAccount = borshCoder.decode(
    INSTRUCTION_ACCOUNT_CLOSE_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    name: '',
    data: {
      close: decodedAccount.close?.toBase58() ?? null,
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
