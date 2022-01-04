import { GetProgramAccountsFilter, PublicKey } from '@solana/web3.js';
import { getBaseFilters } from '.';
import { AccountName, LAYOUT_WORKSPACE_OFFSET } from '../utils';

export const getFiltersByWorkspace = (
  accountName: AccountName,
  authority: PublicKey
): GetProgramAccountsFilter[] => [
  ...getBaseFilters(accountName),
  {
    memcmp: {
      bytes: authority.toBase58(),
      offset: LAYOUT_WORKSPACE_OFFSET,
    },
  },
];
