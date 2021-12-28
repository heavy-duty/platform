import { PublicKey } from '@solana/web3.js';
import { getFilters } from '.';
import { AccountName, LAYOUT_WORKSPACE_OFFSET } from '../utils';

export const getFiltersByWorkspace = (
  accountName: AccountName,
  authority: PublicKey
) =>
  getFilters(accountName)([
    {
      memcmp: {
        bytes: authority.toBase58(),
        offset: LAYOUT_WORKSPACE_OFFSET,
      },
    },
  ]);
