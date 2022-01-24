import { PublicKey } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import { Document, Workspace, WORKSPACE_ACCOUNT_NAME } from '../../../utils';

export const createWorkspaceDocument = (
  publicKey: PublicKey,
  data: Buffer
): Document<Workspace> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    WORKSPACE_ACCOUNT_NAME,
    data
  );

  return {
    id: publicKey.toBase58(),
    metadata: decodedAccount,
    data: {
      name: decodedAccount.name,
      authority: decodedAccount.authority.toBase58(),
    },
  };
};
