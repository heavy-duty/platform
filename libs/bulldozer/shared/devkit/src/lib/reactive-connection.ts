import {
  AccountInfo,
  Commitment,
  Connection,
  ConnectionConfig,
  DataSizeFilter,
  GetProgramAccountsFilter,
  MemcmpFilter,
  PublicKey,
} from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import { fromAccountChange, fromProgramAccountChange } from './operations';
import { shareWhileSubscribed } from './operators';

export class ReactiveConnection extends Connection {
  private readonly _accountSubscriptions = new Map<
    string,
    Observable<{
      publicKey: PublicKey;
      accountInfo: AccountInfo<Buffer>;
    }>
  >();
  private readonly _programAcountSubscriptions = new Map<
    string,
    Observable<{
      publicKey: PublicKey;
      accountInfo: AccountInfo<Buffer>;
    }>
  >();

  constructor(
    endpoint: string,
    commitmentOrConfig?: ConnectionConfig | Commitment | undefined
  ) {
    super(endpoint, commitmentOrConfig);
  }

  private hashGetProgramAccountsRequest(
    programId: string,
    filters: GetProgramAccountsFilter[] = []
  ) {
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
  }

  onAccountChange$(publicKey: PublicKey) {
    const subscription = this._accountSubscriptions.get(publicKey.toBase58());

    if (subscription) {
      return subscription;
    }

    const accountChange$ = fromAccountChange(this, publicKey).pipe(
      shareWhileSubscribed(() =>
        this._accountSubscriptions.delete(publicKey.toBase58())
      ),
      map(({ accountInfo }) => ({
        publicKey,
        accountInfo,
      }))
    );

    this._accountSubscriptions.set(publicKey.toBase58(), accountChange$);

    return accountChange$;
  }

  onProgramAccountChange$(
    programId: PublicKey,
    commitment?: Commitment,
    filters?: GetProgramAccountsFilter[]
  ) {
    const getProgramAccountsRequestHash = this.hashGetProgramAccountsRequest(
      programId.toBase58(),
      filters
    );
    const subscription = this._programAcountSubscriptions.get(
      getProgramAccountsRequestHash
    );

    if (subscription) {
      return subscription;
    }

    const programAccountChange$ = fromProgramAccountChange(
      this,
      programId,
      commitment,
      filters
    ).pipe(
      shareWhileSubscribed(() =>
        this._programAcountSubscriptions.delete(getProgramAccountsRequestHash)
      ),
      map(({ keyedAccountInfo }) => ({
        publicKey: keyedAccountInfo.accountId,
        accountInfo: keyedAccountInfo.accountInfo,
      }))
    );

    this._programAcountSubscriptions.set(
      getProgramAccountsRequestHash,
      programAccountChange$
    );

    return programAccountChange$;
  }
}
