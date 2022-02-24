import { AccountInfo } from '@solana/web3.js';
import { Application, APPLICATION_ACCOUNT_NAME, Document } from '../utils';
import { borshCoder } from './internal';

export const createApplicationDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<Application> => {
  const decodedAccount = borshCoder.decode(
    APPLICATION_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    name: decodedAccount.name,
    data: {
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
