import { AccountsCoder, utils } from '@project-serum/anchor';
import { GetProgramAccountsFilter } from '@solana/web3.js';
import { AccountName } from '../utils';

export const getFilters = (accountName: AccountName) => {
  const discriminator = AccountsCoder.accountDiscriminator(accountName);

  return (filters: GetProgramAccountsFilter[] = []) => [
    {
      memcmp: {
        offset: 0,
        bytes: utils.bytes.bs58.encode(discriminator),
      },
    },
    ...filters,
  ];
};
