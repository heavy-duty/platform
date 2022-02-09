import { AccountInfo } from '@solana/web3.js';
import { bulldozerProgram } from '../programs';
import { Collection, COLLECTION_ACCOUNT_NAME, Document } from '../utils';

export const createCollectionDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<Collection> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    COLLECTION_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    name: decodedAccount.name,
    data: {
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
