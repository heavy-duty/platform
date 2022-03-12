import { Injectable } from '@angular/core';
import {
  HdSolanaApiService,
  TransactionResponse,
} from '@heavy-duty/ngx-solana';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Finality, Transaction, TransactionSignature } from '@solana/web3.js';
import { map, mergeMap } from 'rxjs';
import { HdBroadcasterSocketStore } from './broadcaster-socket.store';

interface TransactionStatus {
  signature: TransactionSignature;
  status: Finality;
  transactionResponse?: TransactionResponse<Transaction>;
}

interface ViewModel {
  transactionStatuses: Map<TransactionSignature, TransactionStatus>;
  error?: unknown;
}

const initialState: ViewModel = {
  transactionStatuses: new Map<TransactionSignature, TransactionStatus>(),
};

@Injectable()
export class HdBroadcasterStore extends ComponentStore<ViewModel> {
  constructor(
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _hdSolanaApiService: HdSolanaApiService
  ) {
    super(initialState);

    this._handleTransactionConfirmed(
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

  private readonly _addTransactionSignature = this.updater(
    (state, signature: TransactionSignature) => ({
      ...state,
      transactionStatuses: state.transactionStatuses.set(signature, {
        signature,
        status: 'confirmed',
      }),
    })
  );

  private readonly _setTransactionResponse = this.updater(
    (
      state,
      {
        signature,
        transactionResponse,
      }: {
        signature: TransactionSignature;
        transactionResponse: TransactionResponse<Transaction>;
      }
    ) => {
      const transactionStatus = state.transactionStatuses.get(signature);

      if (transactionStatus === undefined) {
        return state;
      }

      return {
        ...state,
        transactionStatuses: state.transactionStatuses.set(signature, {
          ...transactionStatus,
          transactionResponse: transactionResponse,
        }),
      };
    }
  );

  private readonly _handleTransactionFinalized = this.updater(
    (state, signature: TransactionSignature) => {
      const transactionStatus = state.transactionStatuses.get(signature);

      if (transactionStatus === undefined) {
        return state;
      }

      return {
        ...state,
        transactionStatuses: state.transactionStatuses.set(signature, {
          ...transactionStatus,
          status: 'finalized',
        }),
      };
    }
  );

  private readonly _handleTransactionConfirmed =
    this.effect<TransactionSignature>(
      mergeMap((transactionSignature) => {
        this._addTransactionSignature(transactionSignature);

        console.log(transactionSignature);

        return this._hdSolanaApiService
          .getTransaction(transactionSignature, 'confirmed')
          .pipe(
            tapResponse(
              (transactionResponse) =>
                this._setTransactionResponse({
                  signature: transactionSignature,
                  transactionResponse,
                }),
              (error) => this.patchState({ error })
            )
          );
      })
    );

  sendTransaction(
    transactionSignature: TransactionSignature,
    topics: string[] = []
  ) {
    this._hdBroadcasterSocketStore.send(
      JSON.stringify({
        event: 'transaction',
        data: {
          transactionSignature,
          topics,
        },
      })
    );
  }

  subscribe(topics: string[]) {
    this._hdBroadcasterSocketStore.send(
      JSON.stringify({
        event: 'subscribe',
        data: topics,
      })
    );
  }

  unsubscribe(topics: string[]) {
    this._hdBroadcasterSocketStore.send(
      JSON.stringify({
        event: 'unsubscribe',
        data: topics,
      })
    );
  }
}
