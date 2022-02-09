import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  AccountInfo,
  GetProgramAccountsConfig,
  PublicKey,
  SignatureStatus,
  Transaction,
  TransactionResponse,
} from '@solana/web3.js';
import { catchError, concatMap, map, Observable, throwError } from 'rxjs';
import { NgxSolanaConfig, NGX_SOLANA_CONFIG } from './config';

@Injectable()
export class NgxSolanaApiService {
  constructor(
    @Inject(NGX_SOLANA_CONFIG)
    private readonly _ngxSolanaConfig: NgxSolanaConfig,
    private readonly _httpClient: HttpClient
  ) {}

  createAndSendTransaction(
    feePayer: string,
    beforeSendFunction: (transaction: Transaction) => Transaction
  ) {
    return this.getRecentBlockhash().pipe(
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

  getAccountInfo(
    pubkey: string,
    commitment = 'confirmed'
  ): Observable<AccountInfo<Buffer> | null> {
    return this._httpClient
      .post<{
        value: AccountInfo<[string, string]>;
        context: { slot: number };
      }>(
        this._ngxSolanaConfig.apiEndpoint,
        [pubkey, { encoding: 'base64', commitment }],
        {
          headers: {
            'solana-rpc-method': 'getAccountInfo',
          },
        }
      )
      .pipe(
        map(({ value }) => ({
          ...value,
          data: Buffer.from(value.data[0], 'base64'),
        }))
      );
  }

  getBalance(pubkey: string) {
    return this._httpClient.post<{ value: number }>(
      this._ngxSolanaConfig.apiEndpoint,
      pubkey,
      {
        headers: {
          'solana-rpc-method': 'getBalance',
        },
      }
    );
  }

  getProgramAccounts(programId: string, config?: GetProgramAccountsConfig) {
    return this._httpClient
      .post<
        {
          account: AccountInfo<[string, string]>;
          pubkey: string;
        }[]
      >(
        this._ngxSolanaConfig.apiEndpoint,
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
  }

  getRecentBlockhash(): Observable<{ blockhash: string }> {
    return this._httpClient
      .post<{ value: { blockhash: string } }>(
        this._ngxSolanaConfig.apiEndpoint,
        null,
        {
          headers: {
            'solana-rpc-method': 'getRecentBlockhash',
          },
        }
      )
      .pipe(map(({ value }) => value));
  }

  getSignatureStatus(signature: string): Observable<SignatureStatus> {
    return this._httpClient
      .post<{ value: SignatureStatus[] }>(
        this._ngxSolanaConfig.apiEndpoint,
        [[signature], { searchTransactionHistory: true }],
        {
          headers: {
            'solana-rpc-method': 'getSignatureStatuses',
          },
        }
      )
      .pipe(map(({ value: [status] }) => status));
  }

  getTransaction(signature: string): Observable<TransactionResponse> {
    return this._httpClient.post<TransactionResponse>(
      this._ngxSolanaConfig.apiEndpoint,
      signature,
      {
        headers: {
          'solana-rpc-method': 'getTransaction',
        },
      }
    );
  }

  sendTransaction(transaction: Transaction): Observable<string> {
    return this._httpClient
      .post<string>(this._ngxSolanaConfig.apiEndpoint, transaction, {
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
      );
  }
}
