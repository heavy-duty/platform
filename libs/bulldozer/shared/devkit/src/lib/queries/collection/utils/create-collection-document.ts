import { AccountInfo, PublicKey } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import { Collection, COLLECTION_ACCOUNT_NAME, Document } from '../../../utils';

export const createCollectionDocument = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): Document<Collection> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    COLLECTION_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey.toBase58(),
    metadata: account,
    data: {
      name: decodedAccount.name,
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
