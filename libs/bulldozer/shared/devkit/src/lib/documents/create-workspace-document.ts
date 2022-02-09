import { AccountInfo } from '@solana/web3.js';
import { bulldozerProgram } from '../programs';
import { Document, Workspace, WORKSPACE_ACCOUNT_NAME } from '../utils';

export const createWorkspaceDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<Workspace> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
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
