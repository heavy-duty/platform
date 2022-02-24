import { AccountInfo } from '@solana/web3.js';
import { Collaborator, COLLABORATOR_ACCOUNT_NAME, Document } from '../utils';
import { borshCoder, decodeCollaboratorStatus } from './internal';

export const createCollaboratorDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<Collaborator> => {
  const decodedAccount = borshCoder.decode(
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
      isAdmin: decodedAccount.isAdmin,
      status: decodeCollaboratorStatus(decodedAccount.status),
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
