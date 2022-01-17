import { AccountsCoder, utils } from '@project-serum/anchor';
import { GetProgramAccountsFilter, MemcmpFilter } from '@solana/web3.js';
import {
  AccountName,
  APPLICATION_FIELD_LABEL,
  AUTHORITY_FIELD_LABEL,
  COLLECTION_FIELD_LABEL,
  FieldLabel,
  Filters,
  INSTRUCTION_FIELD_LABEL,
  LAYOUT_APPLICATION_OFFSET,
  LAYOUT_AUTHORITY_OFFSET,
  LAYOUT_COLLECTION_OFFSET,
  LAYOUT_INSTRUCTION_OFFSET,
  LAYOUT_WORKSPACE_OFFSET,
  WORKSPACE_FIELD_LABEL,
} from '../../utils';

const getOffset = (attributeName: FieldLabel) => {
  switch (attributeName) {
    case AUTHORITY_FIELD_LABEL:
      return LAYOUT_AUTHORITY_OFFSET;
    case WORKSPACE_FIELD_LABEL:
      return LAYOUT_WORKSPACE_OFFSET;
    case APPLICATION_FIELD_LABEL:
      return LAYOUT_APPLICATION_OFFSET;
    case COLLECTION_FIELD_LABEL:
      return LAYOUT_COLLECTION_OFFSET;
    case INSTRUCTION_FIELD_LABEL:
      return LAYOUT_INSTRUCTION_OFFSET;
    default:
      return 0;
  }
};

const createMemcmpFilters = (filters: Filters): MemcmpFilter[] => {
  return Object.keys(filters)
    .map((fieldName) => {
      const filter = filters[fieldName as FieldLabel];

      return filter
        ? {
            memcmp: {
              bytes: filter,
              offset: getOffset(fieldName as FieldLabel),
            },
          }
        : null;
    })
    .filter((filter): filter is MemcmpFilter => filter !== null);
};

export const encodeFilters = (
  accountName: AccountName,
  filters: Filters
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
    ...createMemcmpFilters(filters),
  ];
};
