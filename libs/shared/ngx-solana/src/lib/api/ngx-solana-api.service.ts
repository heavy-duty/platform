import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  AccountInfo,
  PublicKey,
  SignatureStatus,
  Transaction,
  TransactionResponse,
} from '@solana/web3.js';
import { concatMap, map, Observable } from 'rxjs';
import { NgxSolanaConfig, NGX_SOLANA_CONFIG } from '../ngx-solana.config';

@Injectable()
export class NgxSolanaApiService {
  constructor(
    @Inject(NGX_SOLANA_CONFIG)
    private readonly _ngxSolanaConfig: NgxSolanaConfig,
    private readonly _httpClient: HttpClient
  ) {}

  createAndSendTransaction(
    feePayer: PublicKey,
    beforeSendFunction: (transaction: Transaction) => Transaction
  ) {
    return this.getRecentBlockhash().pipe(
      concatMap(({ blockhash }) =>
        this.sendTransaction(
          beforeSendFunction(
            new Transaction({
              feePayer,
              recentBlockhash: blockhash,
            })
          )
        )
      )
    );
  }

  getAccountInfo(pubkey: string) {
    return this._httpClient
      .post<{
        value: AccountInfo<string>;
        context: { slot: number };
      }>(this._ngxSolanaConfig.apiEndpoint, pubkey, {
        headers: {
          'solana-rpc-method': 'getAccountInfo',
        },
      })
      .pipe(map(({ value }) => value));
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
    return this._httpClient.post<string>(
      this._ngxSolanaConfig.apiEndpoint,
      transaction,
      {
        headers: {
          'solana-rpc-method': 'sendTransaction',
        },
      }
    );
  }
}
