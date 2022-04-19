import { AccountInfo } from '@solana/web3.js';
import { Budget, BUDGET_ACCOUNT_NAME, Document } from '../utils';
import { borshCoder } from './internal';

export const createBudgetDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<Budget> => {
  const decodedAccount = borshCoder.decode(BUDGET_ACCOUNT_NAME, account.data);

  return {
    id: publicKey,
    metadata: account,
    name: decodedAccount.name,
    data: {
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      bump: decodedAccount.bump,
      totalValueLocked: decodedAccount.totalValueLocked,
      totalDeposited: decodedAccount.totalDeposited,
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
