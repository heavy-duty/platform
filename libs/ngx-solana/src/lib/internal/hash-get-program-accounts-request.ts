import {
  DataSizeFilter,
  GetProgramAccountsFilter,
  MemcmpFilter,
} from '@solana/web3.js';

export const hashGetProgramAccountsRequest = (
  programId: string,
  filters: GetProgramAccountsFilter[] = []
) => {
  const dataSizeFilters = filters
    .filter((filter): filter is DataSizeFilter => 'dataSize' in filter)
    .sort((a, b) => a.dataSize - b.dataSize)
    .map((filter) => `dataSize:${filter.dataSize}`);
  const memcmpFilters = filters
    .filter((filter): filter is MemcmpFilter => 'memcmp' in filter)
    .sort((a, b) => {
      if (a.memcmp.bytes < b.memcmp.bytes) {
        return -1;
      } else if (a.memcmp.bytes > b.memcmp.bytes) {
        return 1;
      } else {
        return 0;
      }
    })
    .sort((a, b) => a.memcmp.offset - b.memcmp.offset)
    .map((filter) => `memcmp:${filter.memcmp.offset}:${filter.memcmp.bytes}`);
  return [...dataSizeFilters, ...memcmpFilters].reduce(
    (hash, filter) => `${hash}+${filter}`,
    `programId:${programId}`
  );
};
