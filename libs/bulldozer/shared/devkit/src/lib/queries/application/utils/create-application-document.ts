import { PublicKey } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import {
  Application,
  APPLICATION_ACCOUNT_NAME,
  Document,
} from '../../../utils';

export const createApplicationDocument = (
  publicKey: PublicKey,
  data: Buffer
): Document<Application> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    APPLICATION_ACCOUNT_NAME,
    data
  );

  return {
    id: publicKey.toBase58(),
    metadata: decodedAccount,
    data: {
      name: decodedAccount.name,
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
    },
  };
};
