import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  Transaction,
  TransactionConfirmationStatus,
  TransactionSignature,
} from '@solana/web3.js';
import { concatMap, mergeMap, take, tap } from 'rxjs';
import { HdSolanaApiService, TransactionResponse } from './api.service';
import { HdSolanaConnectionStore } from './connection.store';

export interface TransactionStatus {
  signature: TransactionSignature;
  status?: TransactionConfirmationStatus;
  transactionResponse?: TransactionResponse<Transaction>;
}

interface ViewModel {
  transactionStatuses: TransactionStatus[];
}

const initialState: ViewModel = {
  transactionStatuses: [],
};

@Injectable()
export class HdSolanaTransactionsStore extends ComponentStore<ViewModel> {
  readonly transactionStatuses$ = this.select(
    ({ transactionStatuses }) => transactionStatuses
  );
  readonly transactionsInProcess$ = this.select(
    this.transactionStatuses$,
    (transactionStatuses) =>
      transactionStatuses.filter(
        (transactionStatus) => transactionStatus.status === 'confirmed'
      ).length
  );

  constructor(
    private readonly _hdSolanaConnectionStore: HdSolanaConnectionStore,
    private readonly _hdSolanaApiService: HdSolanaApiService
  ) {
    super(initialState);
  }

  private readonly _addTransactionStatus = this.updater<TransactionSignature>(
    (state, signature) => ({
      ...state,
      transactionStatuses: [...state.transactionStatuses, { signature }],
    })
  );

  private readonly _setConfirmationStatus = this.updater<{
    signature: string;
    status: TransactionConfirmationStatus;
  }>((state, { signature, status }) => ({
    ...state,
    transactionStatuses: state.transactionStatuses.map((transactionStatus) =>
      transactionStatus.signature === signature
        ? { ...transactionStatus, status }
        : transactionStatus
    ),
  }));

  private readonly _setTransactionResponse = this.updater<{
    signature: string;
    transactionResponse: TransactionResponse<Transaction>;
  }>((state, { signature, transactionResponse }) => ({
    ...state,
    transactionStatuses: state.transactionStatuses.map((transactionStatus) =>
      transactionStatus.signature === signature
        ? {
            ...transactionStatus,
            transactionResponse,
          }
        : transactionStatus
    ),
  }));

  private readonly _handleTransactionConfirmed =
    this.effect<TransactionSignature>(
      mergeMap((signature) =>
        this._hdSolanaConnectionStore
          .onSignatureChange(signature, 'confirmed')
          .pipe(
            take(1),
            concatMap(() => {
              this._setConfirmationStatus({
                signature,
                status: 'confirmed',
              });

              return this._hdSolanaApiService
                .getTransaction(signature, 'confirmed')
                .pipe(
                  tap((transactionResponse) => {
                    this._setTransactionResponse({
                      signature,
                      transactionResponse,
                    });
                  })
                );
            })
          )
      )
    );

  private readonly _handleTransactionFinalized =
    this.effect<TransactionSignature>(
      mergeMap((signature) =>
        this._hdSolanaConnectionStore
          .onSignatureChange(signature, 'finalized')
          .pipe(
            take(1),
            concatMap(() => {
              this._setConfirmationStatus({
                signature,
                status: 'finalized',
              });

              return this._hdSolanaApiService.getTransaction(signature).pipe(
                tap((transactionResponse) =>
                  this._setTransactionResponse({
                    signature,
                    transactionResponse,
                  })
                )
              );
            })
          )
      )
    );

  reportProgress(signature: string) {
    const { transactionStatuses } = this.get();

    if (
      !transactionStatuses.some(
        (transactionStatus) => transactionStatus.signature === signature
      )
    ) {
      this._addTransactionStatus(signature);
      this._handleTransactionConfirmed(signature);
      this._handleTransactionFinalized(signature);
    }
  }
}
