import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AccountInfo,
  GetMultipleAccountsConfig,
  GetProgramAccountsConfig,
  PublicKey,
  SignatureStatus,
  Transaction,
  TransactionResponse,
} from '@solana/web3.js';
import {
  catchError,
  concatMap,
  first,
  isObservable,
  map,
  Observable,
  of,
  throwError,
} from 'rxjs';
import { HdSolanaConfigStore } from './config.store';

export interface KeyedAccountInfo {
  accountId: string;
  accountInfo: AccountInfo<Buffer>;
}

@Injectable()
export class HdSolanaApiService {
  constructor(
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore,
    private readonly _httpClient: HttpClient
  ) {}

  createAndSendTransaction(
    feePayer: string,
    beforeSendFunction: (transaction: Transaction) => Transaction
  ) {
    return this.getLatestBlockhash().pipe(
      concatMap(({ blockhash }) =>
        this.sendTransaction(
          beforeSendFunction(
            new Transaction({
              feePayer: new PublicKey(feePayer),
              recentBlockhash: blockhash,
            })
          )
        )
      )
    );
  }

  createTransaction(feePayer: string) {
    return this.getLatestBlockhash().pipe(
      map(
        ({ blockhash }) =>
          new Transaction({
            feePayer: new PublicKey(feePayer),
            recentBlockhash: blockhash,
          })
      )
    );
  }

  getAccountInfo(
    pubkey: string,
    commitment = 'confirmed'
  ): Observable<AccountInfo<Buffer> | null> {
    return this._hdSolanaConfigStore.apiEndpoint$.pipe(
      first(),
      concatMap((apiEndpoint) => {
        if (apiEndpoint === null) {
          return throwError(() => 'API endpoint missing');
        }

        return this._httpClient
          .post<{
            value: AccountInfo<[string, string]>;
            context: { slot: number };
          }>(apiEndpoint, [pubkey, { encoding: 'base64', commitment }], {
            headers: {
              'solana-rpc-method': 'getAccountInfo',
            },
          })
          .pipe(
            map(
              ({ value }) =>
                value && {
                  ...value,
                  data: Buffer.from(value.data[0], 'base64'),
                }
            )
          );
      })
    );
  }

  getBalance(pubkey: string) {
    return this._hdSolanaConfigStore.apiEndpoint$.pipe(
      first(),
      concatMap((apiEndpoint) => {
        if (apiEndpoint === null) {
          return throwError(() => 'API endpoint missing');
        }

        return this._httpClient.post<{ value: number }>(apiEndpoint, pubkey, {
          headers: {
            'solana-rpc-method': 'getBalance',
          },
        });
      })
    );
  }

  getProgramAccounts(programId: string, config?: GetProgramAccountsConfig) {
    return this._hdSolanaConfigStore.apiEndpoint$.pipe(
      first(),
      concatMap((apiEndpoint) => {
        if (apiEndpoint === null) {
          return throwError(() => 'API endpoint missing');
        }

        return this._httpClient
          .post<
            {
              account: AccountInfo<[string, string]>;
              pubkey: string;
            }[]
          >(
            apiEndpoint,
            [
              programId,
              {
                encoding: config?.encoding ?? 'base64',
                commitment: config?.commitment ?? 'confirmed',
                filters: config?.filters ?? [],
                dataSlice: config?.dataSlice,
              },
            ],
            {
              headers: {
                'solana-rpc-method': 'getProgramAccounts',
              },
            }
          )
          .pipe(
            map((programAccounts) =>
              programAccounts.map(({ pubkey, account }) => ({
                pubkey,
                account: {
                  ...account,
                  data: Buffer.from(account.data[0], 'base64'),
                },
              }))
            )
          );
      })
    );
  }

  getMultipleAccounts(
    pubkeys: string[],
    config?: GetMultipleAccountsConfig
  ): Observable<(KeyedAccountInfo | null)[]> {
    return this._hdSolanaConfigStore.apiEndpoint$.pipe(
      first(),
      concatMap((apiEndpoint) => {
        if (apiEndpoint === null) {
          return throwError(() => 'API endpoint missing');
        }

        return this._httpClient
          .post<{
            value: AccountInfo<[string, string]>[];
            context: { slot: number };
          }>(
            apiEndpoint,
            [
              pubkeys,
              {
                encoding: config?.encoding ?? 'base64',
                commitment: config?.commitment ?? 'confirmed',
              },
            ],
            {
              headers: {
                'solana-rpc-method': 'getMultipleAccounts',
              },
            }
          )
          .pipe(
            map(({ value }) =>
              value.map((account, index) => ({
                accountId: pubkeys[index],
                accountInfo: {
                  ...account,
                  data: Buffer.from(account.data[0], 'base64'),
                },
              }))
            )
          );
      })
    );
  }

  getLatestBlockhash(): Observable<{ blockhash: string }> {
    return this._hdSolanaConfigStore.apiEndpoint$.pipe(
      first(),
      concatMap((apiEndpoint) => {
        if (apiEndpoint === null) {
          return throwError(() => 'API endpoint missing');
        }

        return this._httpClient
          .post<{ value: { blockhash: string } }>(apiEndpoint, null, {
            headers: {
              'solana-rpc-method': 'getLatestBlockhash',
            },
          })
          .pipe(map(({ value }) => value));
      })
    );
  }

  getSignatureStatus(signature: string): Observable<SignatureStatus> {
    return this._hdSolanaConfigStore.apiEndpoint$.pipe(
      first(),
      concatMap((apiEndpoint) => {
        if (apiEndpoint === null) {
          return throwError(() => 'API endpoint missing');
        }

        return this._httpClient
          .post<{ value: SignatureStatus[] }>(
            apiEndpoint,
            [[signature], { searchTransactionHistory: true }],
            {
              headers: {
                'solana-rpc-method': 'getSignatureStatuses',
              },
            }
          )
          .pipe(map(({ value: [status] }) => status));
      })
    );
  }

  getTransaction(signature: string): Observable<TransactionResponse> {
    return this._hdSolanaConfigStore.apiEndpoint$.pipe(
      first(),
      concatMap((apiEndpoint) => {
        if (apiEndpoint === null) {
          return throwError(() => 'API endpoint missing');
        }

        return this._httpClient.post<TransactionResponse>(
          apiEndpoint,
          signature,
          {
            headers: {
              'solana-rpc-method': 'getTransaction',
            },
          }
        );
      })
    );
  }

  sendTransaction(
    transaction: Transaction | Observable<Transaction>
  ): Observable<string> {
    return this._hdSolanaConfigStore.apiEndpoint$.pipe(
      first(),
      concatMap((apiEndpoint) => {
        if (apiEndpoint === null) {
          return throwError(() => 'API endpoint missing');
        }

        return (isObservable(transaction) ? transaction : of(transaction)).pipe(
          concatMap((transaction) =>
            this._httpClient
              .post<string>(apiEndpoint, transaction, {
                headers: {
                  'solana-rpc-method': 'sendTransaction',
                },
              })
              .pipe(
                catchError((error) => {
                  if (
                    'InstructionError' in error &&
                    error.InstructionError.length === 2 &&
                    typeof error.InstructionError[1].Custom === 'number'
                  ) {
                    return throwError(() => error.InstructionError[1].Custom);
                  }

                  return throwError(() => error);
                })
              )
          )
        );
      })
    );
  }
}
