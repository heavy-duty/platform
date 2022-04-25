import { AccountInfo } from '@solana/web3.js';
import {
  Document,
  InstructionAccountPayer,
  INSTRUCTION_ACCOUNT_PAYER_ACCOUNT_NAME,
} from '../utils';
import { borshCoder } from './internal';

export const createInstructionAccountPayerDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<InstructionAccountPayer> => {
  const decodedAccount = borshCoder.decode(
    INSTRUCTION_ACCOUNT_PAYER_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    name: '',
    data: {
      payer: decodedAccount.payer?.toBase58() ?? null,
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
