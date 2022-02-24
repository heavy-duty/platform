import { AccountInfo } from '@solana/web3.js';
import { Document, Workspace, WORKSPACE_ACCOUNT_NAME } from '../utils';
import { borshCoder } from './internal';

export const createWorkspaceDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<Workspace> => {
  const decodedAccount = borshCoder.decode(
    WORKSPACE_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    name: decodedAccount.name,
    data: {
      authority: decodedAccount.authority.toBase58(),
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
