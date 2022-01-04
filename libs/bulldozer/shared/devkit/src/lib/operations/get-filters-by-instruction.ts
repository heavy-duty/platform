import { GetProgramAccountsFilter, PublicKey } from '@solana/web3.js';
import { getBaseFilters } from '.';
import { AccountName, LAYOUT_INSTRUCTION_OFFSET } from '../utils';

export const getFiltersByInstruction = (
  accountName: AccountName,
  instruction: PublicKey
): GetProgramAccountsFilter[] => [
  ...getBaseFilters(accountName),
  {
    memcmp: {
      bytes: instruction.toBase58(),
      offset: LAYOUT_INSTRUCTION_OFFSET,
    },
  },
];
