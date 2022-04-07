import { Injectable } from '@angular/core';
import {
  HdSolanaApiService,
  TransactionResponse,
} from '@heavy-duty/ngx-solana';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Finality, Transaction, TransactionSignature } from '@solana/web3.js';
import { concatMap, EMPTY, forkJoin, map, mergeMap, of, switchMap } from 'rxjs';
import { HdBroadcasterSocketStore } from './broadcaster-socket.store';

export interface TransactionStatus {
  signature: TransactionSignature;
  status: Finality;
  topic: string;
  transactionResponse?: TransactionResponse<Transaction>;
  confirmedAt?: number;
}

interface ViewModel {
  pendingTransactionStatusMap: Map<
    TransactionSignature,
    TransactionStatus
  > | null;
  transactionStatusMap: Map<TransactionSignature, TransactionStatus>;
  error?: unknown;
  lastTransactionStatus: TransactionStatus | null;
}

const initialState: ViewModel = {
  pendingTransactionStatusMap: null,
  transactionStatusMap: new Map<TransactionSignature, TransactionStatus>(),
  lastTransactionStatus: null,
};

@Injectable()
export class HdBroadcasterStore extends ComponentStore<ViewModel> {
  readonly transactionStatusMap$ = this.select(
    ({ transactionStatusMap }) => transactionStatusMap
  );
  readonly pendingTransactionStatusMap$ = this.select(
    ({ pendingTransactionStatusMap }) => pendingTransactionStatusMap
  );
  readonly transactionStatuses$ = this.select(
    this.transactionStatusMap$,
    (transactionStatusMap) =>
      Array.from(
        transactionStatusMap,
        ([, transactionStatus]) => transactionStatus
      )
  );
  readonly pendingTransactionStatuses$ = this.select(
    this.pendingTransactionStatusMap$,
    (pendingTransactionStatusMap) =>
      pendingTransactionStatusMap
        ? Array.from(
            pendingTransactionStatusMap,
            ([, pendingTransactionStatus]) => pendingTransactionStatus
          )
        : null
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
  }>((state, { signature, topic }) => ({
    ...state,
    transactionStatusMap: new Map(
      state.transactionStatusMap.set(signature, {
        signature,
        topic,
        status: 'confirmed',
        confirmedAt: Date.now(),
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
    const pendingTransactionStatus =
      state.pendingTransactionStatusMap?.get(signature);

    if (
      transactionStatus === undefined &&
      pendingTransactionStatus === undefined
    ) {
      return state;
    }

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
      pendingTransactionStatusMap:
        pendingTransactionStatus === undefined
          ? state.pendingTransactionStatusMap
          : (state.pendingTransactionStatusMap === null
              ? new Map<string, TransactionStatus>()
              : new Map(state.pendingTransactionStatusMap)
            ).set(signature, {
              ...pendingTransactionStatus,
              status: 'finalized',
            }),
    };
  });

  readonly handleTransactionConfirmed = this.effect<{
    signature: TransactionSignature;
    topic: string;
  }>(
    mergeMap(({ signature, topic }) => {
      this._addTransactionSignature({ signature, topic });

      return this._hdSolanaApiService
        .getTransaction(signature, 'confirmed')
        .pipe(
          tapResponse(
            (transactionResponse) => {
              this.patchState({
                lastTransactionStatus: {
                  topic,
                  signature,
                  transactionResponse,
                  status: 'confirmed',
                },
              });

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
          concatMap((confirmedSignatureInfos) => {
            const reallyConfirmedSignatureInfos =
              confirmedSignatureInfos.filter(
                (confirmedSignatureInfo) =>
                  confirmedSignatureInfo.confirmationStatus === 'confirmed'
              );

            if (reallyConfirmedSignatureInfos.length === 0) {
              return of([]);
            }

            return forkJoin(
              reallyConfirmedSignatureInfos.map(({ signature }) =>
                this._hdSolanaApiService
                  .getTransaction(signature, 'confirmed')
                  .pipe(
                    map((transactionResponse) => ({
                      signature,
                      topic: workspaceId,
                      status: 'confirmed' as Finality,
                      confirmedAt: Date.now(),
                      transactionResponse,
                    }))
                  )
              )
            );
          }),
          tapResponse(
            (transactionStatuses) => {
              this.patchState({
                pendingTransactionStatusMap: transactionStatuses.reduce(
                  (pendingTransactionStatusMap, transactionStatus) =>
                    new Map(pendingTransactionStatusMap).set(
                      transactionStatus.signature,
                      transactionStatus
                    ),
                  new Map<string, TransactionStatus>()
                ),
                transactionStatusMap: transactionStatuses.reduce(
                  (transactionStatusMap, transactionStatus) =>
                    new Map(transactionStatusMap).set(
                      transactionStatus.signature,
                      transactionStatus
                    ),
                  new Map<string, TransactionStatus>()
                ),
              });
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
}
