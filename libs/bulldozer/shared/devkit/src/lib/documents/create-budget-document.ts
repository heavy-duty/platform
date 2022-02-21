import { AccountInfo } from '@solana/web3.js';
import { bulldozerProgram } from '../programs';
import { Budget, BUDGET_ACCOUNT_NAME, Document } from '../utils';

export const createBudgetDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<Budget> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    BUDGET_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    name: decodedAccount.name,
    data: {
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      bump: decodedAccount.bump,
    },
    createdAt: decodedAccount.createdAt,
  };
};
