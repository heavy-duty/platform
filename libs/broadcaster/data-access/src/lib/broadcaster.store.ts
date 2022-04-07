import { Injectable } from '@angular/core';
import {
  HdSolanaApiService,
  TransactionResponse,
} from '@heavy-duty/ngx-solana';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Finality, Transaction, TransactionSignature } from '@solana/web3.js';
import { EMPTY, map, mergeMap, switchMap } from 'rxjs';
import { HdBroadcasterSocketStore } from './broadcaster-socket.store';

export interface TransactionStatus {
  signature: TransactionSignature;
  status: Finality;
  topic: string;
  transactionResponse?: TransactionResponse<Transaction>;
  confirmedAt?: number;
  isPending?: boolean;
}

interface ViewModel {
  transactionStatusMap: Map<TransactionSignature, TransactionStatus>;
  error?: unknown;
  lastTransactionStatus: TransactionStatus | null;
}

const initialState: ViewModel = {
  transactionStatusMap: new Map<TransactionSignature, TransactionStatus>(),
  lastTransactionStatus: null,
};

@Injectable()
export class HdBroadcasterStore extends ComponentStore<ViewModel> {
  readonly transactionStatusMap$ = this.select(
    ({ transactionStatusMap }) => transactionStatusMap
  );
  readonly transactionStatuses$ = this.select(
    this.transactionStatusMap$,
    (transactionStatusMap) =>
      Array.from(
        transactionStatusMap,
        ([, transactionStatus]) => transactionStatus
      )
  );
  readonly transactionsInProcess$ = this.select(
    this.transactionStatuses$,
    (transactionStatuses) =>
      transactionStatuses.filter(
        (transactionStatus) => transactionStatus.status === 'confirmed'
      ).length ?? 0
  );
  readonly lastTransactionStatus$ = this.select(
    ({ lastTransactionStatus }) => lastTransactionStatus
  );

  constructor(
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _hdSolanaApiService: HdSolanaApiService
  ) {
    super(initialState);

    this.handleTransactionConfirmed(
      this._hdBroadcasterSocketStore
        .fromEvent('transactionConfirmed')
        .pipe(map((message) => message.data))
    );
    this._handleTransactionFinalized(
      this._hdBroadcasterSocketStore
        .fromEvent('transactionFinalized')
        .pipe(map((message) => message.data))
    );
  }

  private readonly _addTransactionSignature = this.updater<{
    signature: TransactionSignature;
    topic: string;
    isPending?: boolean;
  }>((state, { signature, topic, isPending = false }) => ({
    ...state,
    transactionStatusMap: new Map(
      state.transactionStatusMap.set(signature, {
        signature,
        topic,
        status: 'confirmed',
        confirmedAt: Date.now(),
        isPending,
      })
    ),
  }));

  private readonly _setTransactionResponse = this.updater<{
    signature: TransactionSignature;
    transactionResponse: TransactionResponse<Transaction>;
  }>((state, { signature, transactionResponse }) => {
    const transactionStatus = state.transactionStatusMap.get(signature);

    if (transactionStatus === undefined) {
      return state;
    }

    return {
      ...state,
      transactionStatusMap: new Map(
        state.transactionStatusMap.set(signature, {
          ...transactionStatus,
          transactionResponse: transactionResponse,
        })
      ),
    };
  });

  private readonly _handleTransactionFinalized = this.updater<{
    signature: TransactionSignature;
    topic: string;
  }>((state, { signature }) => {
    const transactionStatus = state.transactionStatusMap.get(signature);

    return {
      ...state,
      lastTransactionStatus:
        transactionStatus === undefined
          ? state.lastTransactionStatus
          : {
              ...transactionStatus,
              status: 'finalized',
            },
      transactionStatusMap:
        transactionStatus === undefined
          ? state.transactionStatusMap
          : new Map(state.transactionStatusMap).set(signature, {
              ...transactionStatus,
              status: 'finalized',
            }),
    };
  });

  readonly handleTransactionConfirmed = this.effect<{
    signature: TransactionSignature;
    topic: string;
    isPending?: boolean;
  }>(
    mergeMap(({ signature, topic, isPending = false }) => {
      this._addTransactionSignature({ signature, topic, isPending });

      return this._hdSolanaApiService
        .getTransaction(signature, 'confirmed')
        .pipe(
          tapResponse(
            (transactionResponse) => {
              if (!isPending) {
                this.patchState({
                  lastTransactionStatus: {
                    topic,
                    signature,
                    transactionResponse,
                    status: 'confirmed',
                    isPending: false,
                  },
                });
              }

              this._setTransactionResponse({
                signature: signature,
                transactionResponse,
              });
            },
            (error) => this.patchState({ error })
          )
        );
    })
  );

  readonly loadPendingInstructions = this.effect<string | null>(
    switchMap((workspaceId) => {
      if (workspaceId === null) {
        return EMPTY;
      }

      return this._hdSolanaApiService
        .getSignaturesForAddress(workspaceId, undefined, 'confirmed')
        .pipe(
          tapResponse(
            (confirmedSignatureInfos) => {
              confirmedSignatureInfos
                .filter(
                  (confirmedSignatureInfo) =>
                    confirmedSignatureInfo.confirmationStatus === 'confirmed'
                )
                .forEach((confirmedSignatureInfo) =>
                  this.handleTransactionConfirmed({
                    signature: confirmedSignatureInfo.signature,
                    topic: workspaceId,
                    isPending: true,
                  })
                );
            },
            (error) => this.patchState({ error })
          )
        );
    })
  );

  sendTransaction(transactionSignature: TransactionSignature, topic: string) {
    this._hdBroadcasterSocketStore.send(
      JSON.stringify({
        event: 'transaction',
        data: {
          transactionSignature,
          topic,
        },
      })
    );
  }

  subscribe(topic: string) {
    this._hdBroadcasterSocketStore.send(
      JSON.stringify({
        event: 'subscribe',
        data: topic,
      })
    );
  }

  unsubscribe(topic: string) {
    this._hdBroadcasterSocketStore.send(
      JSON.stringify({
        event: 'unsubscribe',
        data: topic,
      })
    );
  }

  clearTransactions() {
    this.patchState({
      transactionStatusMap: new Map<TransactionSignature, TransactionStatus>(),
      lastTransactionStatus: null,
    });
  }
}
