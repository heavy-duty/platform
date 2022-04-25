import { AccountInfo } from '@solana/web3.js';
import { Document, User, USER_ACCOUNT_NAME } from '../utils';
import { borshCoder } from './internal';

export const createUserDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<User> => {
  const decodedAccount = borshCoder.decode(USER_ACCOUNT_NAME, account.data);

  return {
    id: publicKey,
    metadata: account,
    name: decodedAccount.name,
    data: {
      authority: decodedAccount.authority.toBase58(),
      bump: decodedAccount.bump,
      userName: decodedAccount.userName,
      thumbnailUrl: decodedAccount.thumbnailUrl,
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
