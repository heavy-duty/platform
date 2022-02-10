import { BorshAccountsCoder, utils } from '@heavy-duty/anchor';
import {
  Commitment,
  GetProgramAccountsFilter,
  MemcmpFilter,
} from '@solana/web3.js';
import { AccountName } from '../../utils';
import {
  APPLICATION_FIELD_LABEL,
  AUTHORITY_FIELD_LABEL,
  COLLECTION_FIELD_LABEL,
  FieldLabel,
  Filters,
  INSTRUCTION_FIELD_LABEL,
  WORKSPACE_FIELD_LABEL,
} from './types';

const LAYOUT_AUTHORITY_OFFSET = 8;
const LAYOUT_WORKSPACE_OFFSET = 40;
const LAYOUT_APPLICATION_OFFSET = 72;
const LAYOUT_COLLECTION_OFFSET = 104;
const LAYOUT_INSTRUCTION_OFFSET = 104;

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

const encodeFilters = (
  accountName: AccountName,
  filters: Filters
): GetProgramAccountsFilter[] => {
  return [
    {
      memcmp: {
        offset: 0,
        bytes: utils.bytes.bs58.encode(
          BorshAccountsCoder.accountDiscriminator(accountName)
        ),
      },
    },
    ...createMemcmpFilters(filters),
  ];
};

export type QueryFilters<KeyTypes extends string> = Partial<{
  [key in KeyTypes]: string;
}>;

export class QueryBuilder<FilterKeys extends string> {
  private _filters: QueryFilters<FilterKeys> = {};
  private _commitment?: Commitment;

  constructor(private readonly _accountName: AccountName) {}

  setCommitment(commitment: Commitment) {
    this._commitment = commitment;
    return this;
  }

  where(filters: QueryFilters<FilterKeys>) {
    this._filters = filters;
    return this;
  }

  build() {
    return {
      filters: encodeFilters(this._accountName, this._filters),
      commitment: this._commitment,
    };
  }
}
