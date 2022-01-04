import { GetProgramAccountsFilter, PublicKey } from '@solana/web3.js';
import { getBaseFilters } from '.';
import { AccountName, LAYOUT_COLLECTION_OFFSET } from '../utils';

export const getFiltersByCollection = (
  accountName: AccountName,
  collection: PublicKey
): GetProgramAccountsFilter[] => [
  ...getBaseFilters(accountName),
  {
    memcmp: {
      bytes: collection.toBase58(),
      offset: LAYOUT_COLLECTION_OFFSET,
    },
  },
];
