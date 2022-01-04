import { AccountsCoder, utils } from '@project-serum/anchor';
import { GetProgramAccountsFilter } from '@solana/web3.js';
import { AccountName } from '../utils';

export const getBaseFilters = (
  accountName: AccountName
): GetProgramAccountsFilter[] => {
  return [
    {
      memcmp: {
        offset: 0,
        bytes: utils.bytes.bs58.encode(
          AccountsCoder.accountDiscriminator(accountName)
        ),
      },
    },
  ];
};
