import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  Transaction,
  TransactionConfirmationStatus,
  TransactionResponse,
  TransactionSignature,
} from '@solana/web3.js';
import { concatMap, mergeMap, take, tap } from 'rxjs';
import { HdSolanaApiService } from './api.service';
import { HdSolanaConnectionStore } from './connection.store';

export interface TransactionStatus {
  signature: TransactionSignature;
  confirmationStatus?: TransactionConfirmationStatus;
  transaction?: Transaction;
  transactionResponse?: TransactionResponse;
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
        (transactionStatus) =>
          transactionStatus.confirmationStatus === 'confirmed'
      ).length
  );

  constructor(
    private readonly _hdSolanaConnectionStore: HdSolanaConnectionStore,
    private readonly _hdSolanaApiService: HdSolanaApiService
  ) {
    super(initialState);
  }

  private readonly _addTransactionStatus = this.updater(
    (state, signature: TransactionSignature) => ({
      ...state,
      transactionStatuses: [...state.transactionStatuses, { signature }],
    })
  );

  private readonly _setConfirmationStatus = this.updater(
    (
      state,
      {
        signature,
        confirmationStatus,
      }: {
        signature: string;
        confirmationStatus: TransactionConfirmationStatus;
      }
    ) => ({
      ...state,
      transactionStatuses: state.transactionStatuses.map((transactionStatus) =>
        transactionStatus.signature === signature
          ? { ...transactionStatus, confirmationStatus }
          : transactionStatus
      ),
    })
  );

  private readonly _setTransactionResponse = this.updater(
    (
      state,
      {
        signature,
        transactionResponse,
      }: {
        signature: string;
        transactionResponse: TransactionResponse;
      }
    ) => ({
      ...state,
      transactionStatuses: state.transactionStatuses.map((transactionStatus) =>
        transactionStatus.signature === signature
          ? {
              ...transactionStatus,
              transactionResponse,
              transaction: Transaction.from(
                Buffer.from(
                  (transactionResponse.transaction as any)[0] as string,
                  'base64'
                )
              ),
            }
          : transactionStatus
      ),
    })
  );

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
                confirmationStatus: 'confirmed',
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
                confirmationStatus: 'finalized',
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
