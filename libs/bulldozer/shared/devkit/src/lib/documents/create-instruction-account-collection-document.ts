import { AccountInfo } from '@solana/web3.js';
import {
  Document,
  InstructionAccountCollection,
  INSTRUCTION_ACCOUNT_COLLECTION_ACCOUNT_NAME,
} from '../utils';
import { borshCoder } from './internal';

export const createInstructionAccountCollectionDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<InstructionAccountCollection> => {
  const decodedAccount = borshCoder.decode(
    INSTRUCTION_ACCOUNT_COLLECTION_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    name: '',
    data: {
      collection: decodedAccount.collection?.toBase58() ?? null,
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
