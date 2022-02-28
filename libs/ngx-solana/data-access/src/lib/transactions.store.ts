import { Injectable } from '@angular/core';
import {
  HdSolanaApiService,
  HdSolanaConnectionStore,
} from '@heavy-duty/ngx-solana';
import { ComponentStore } from '@ngrx/component-store';
import {
  SignatureStatus,
  Transaction,
  TransactionConfirmationStatus,
  TransactionResponse,
  TransactionSignature,
} from '@solana/web3.js';
import { concatMap, mergeMap, take, tap } from 'rxjs';

export interface TransactionStatus {
  transaction: Transaction;
  signature: TransactionSignature;
  signatureStatus?: SignatureStatus;
  confirmationStatus?: TransactionConfirmationStatus;
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
    (
      state,
      transactionStatus: {
        signature: TransactionSignature;
        transaction: Transaction;
      }
    ) => ({
      ...state,
      transactionStatuses: [...state.transactionStatuses, transactionStatus],
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
          ? { ...transactionStatus, transactionResponse }
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
            tap(() =>
              this._setConfirmationStatus({
                signature,
                confirmationStatus: 'confirmed',
              })
            )
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

  reportProgress(transaction: Transaction, signature: string) {
    this._addTransactionStatus({ transaction, signature });
    this._handleTransactionConfirmed(signature);
    this._handleTransactionFinalized(signature);
  }
}
