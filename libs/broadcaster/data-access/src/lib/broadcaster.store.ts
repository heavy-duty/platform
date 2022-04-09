import { Injectable } from '@angular/core';
import { TransactionResponse } from '@heavy-duty/ngx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { Finality, Transaction, TransactionSignature } from '@solana/web3.js';
import { HdBroadcasterSocketStore } from './broadcaster-socket.store';

export interface TransactionStatus2 {
  signature: TransactionSignature;
  status: Finality;
  topic: string;
  transactionResponse: TransactionResponse<Transaction>;
  confirmedAt: number;
}

interface ViewModel {
  pendingTransactionStatusMap: Map<
    TransactionSignature,
    TransactionStatus2
  > | null;
  transactionStatusMap: Map<TransactionSignature, TransactionStatus2>;
  error?: unknown;
  lastTransactionStatus: TransactionStatus2 | null;
}

const initialState: ViewModel = {
  pendingTransactionStatusMap: null,
  transactionStatusMap: new Map<TransactionSignature, TransactionStatus2>(),
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
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore
  ) {
    super(initialState);
  }

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
