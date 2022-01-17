import { AccountInfo, PublicKey } from '@solana/web3.js';
import {
  bulldozerProgram,
  Document,
  Workspace,
  WORKSPACE_ACCOUNT_NAME,
} from '..';

export const createWorkspaceDocument = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): Document<Workspace> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    WORKSPACE_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey.toBase58(),
    metadata: account,
    name: decodedAccount.name,
    data: {
      authority: decodedAccount.authority.toBase58(),
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
