import { PublicKey } from '@solana/web3.js';
import { getFilters } from '.';
import { AccountName, LAYOUT_AUTHORITY_OFFSET } from '../utils';

export const getFiltersByAuthority = (
  accountName: AccountName,
  authority: PublicKey
) =>
  getFilters(accountName)([
    {
      memcmp: {
        bytes: authority.toBase58(),
        offset: LAYOUT_AUTHORITY_OFFSET,
      },
    },
  ]);
