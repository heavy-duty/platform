import { AccountInfo } from '@solana/web3.js';
import { bulldozerProgram } from '../programs';
import { Collaborator, COLLABORATOR_ACCOUNT_NAME, Document } from '../utils';

export const createCollaboratorDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<Collaborator> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    COLLABORATOR_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    name: decodedAccount.name,
    data: {
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      user: decodedAccount.user.toBase58(),
      bump: decodedAccount.bump,
    },
    createdAt: decodedAccount.createdAt,
  };
};
