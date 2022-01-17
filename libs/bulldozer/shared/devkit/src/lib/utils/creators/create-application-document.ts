import { AccountInfo, PublicKey } from '@solana/web3.js';
import {
  Application,
  APPLICATION_ACCOUNT_NAME,
  bulldozerProgram,
  Document,
} from '..';

export const createApplicationDocument = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): Document<Application> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    APPLICATION_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey.toBase58(),
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
