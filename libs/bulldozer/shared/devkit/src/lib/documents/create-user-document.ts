import { AccountInfo } from '@solana/web3.js';
import { bulldozerProgram } from '../programs';
import { Document, User, USER_ACCOUNT_NAME } from '../utils';

export const createUserDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<User> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    USER_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    name: decodedAccount.name,
    data: {
      authority: decodedAccount.authority.toBase58(),
      bump: decodedAccount.bump,
    },
    createdAt: decodedAccount.createdAt,
  };
};
