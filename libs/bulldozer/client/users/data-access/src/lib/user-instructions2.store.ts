import { Injectable } from '@angular/core';
import {
  HdBroadcasterSocketStore,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import {
  flattenInstructions,
  InstructionStatus,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined, tapEffect } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List, Map, Set } from 'immutable';
import { map, noop, switchMap, tap } from 'rxjs';

interface ViewModel {
  transactions: List<TransactionStatus>;
  viewedTransactionSignatures: Set<TransactionSignature>;
}

const initialState: ViewModel = {
  viewedTransactionSignatures: Set(),
  transactions: List(),
};

@Injectable()
export class UserInstructionsStore2 extends ComponentStore<ViewModel> {
  private readonly _topicName$ = this.select(
    this._walletStore.publicKey$,
    (walletPublicKey) =>
      walletPublicKey === null ? null : `authority:${walletPublicKey}`
  );
  readonly viewedTransactionSignatures$ = this.select(
    ({ viewedTransactionSignatures }) => viewedTransactionSignatures
  );
  readonly instructionStatuses$ = this.select(
    this.select(({ transactions }) => transactions),
    (transactions) =>
      transactions
        .reduce(
          (currentInstructions, transactionStatus) =>
            currentInstructions.concat(flattenInstructions(transactionStatus)),
          List<InstructionStatus>()
        )
        .sort(
          (a, b) =>
            a.transactionStatus.timestamp - b.transactionStatus.timestamp
        )
  );
  readonly groupedInstructionStatuses$ = this.select(
    this.instructionStatuses$,
    (instructionStatuses) => {
      if (instructionStatuses === null) {
        return null;
      }

      return instructionStatuses
        .reduce(
          (groupedInstructionStatuses, instructionStatus) =>
            groupedInstructionStatuses.merge(
              Map(
                instructionStatus.transactionStatus.transaction.instructions.map(
                  (_, index) => [
                    `${instructionStatus.transactionStatus.signature}:${index}`,
                    instructionStatus,
                  ]
                )
              )
            ),
          Map<string, InstructionStatus>()
        )
        .toList()
        .sort(
          (a, b) =>
            b.transactionStatus.timestamp - a.transactionStatus.timestamp
        );
    }
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore
  ) {
    super(initialState);

    this._handleTransaction(
      this._topicName$.pipe(
        isNotNullOrUndefined,
        switchMap((topicName) =>
          this._hdBroadcasterSocketStore
            .fromEvent(topicName)
            .pipe(map((message) => message.data))
        )
      )
    );
    this._registerTopic(
      this.select(
        this._hdBroadcasterSocketStore.connected$,
        this._topicName$,
        (connected, topicName) => ({
          connected,
          topicName,
        })
      )
    );
  }

  private readonly _addTransaction = this.updater<TransactionStatus>(
    (state, transaction) => ({
      ...state,
      transactions: state.transactions.push(transaction),
    })
  );

  private readonly _removeTransaction = this.updater<TransactionSignature>(
    (state, signature) => ({
      ...state,
      transactions: state.transactions.filter(
        (transaction) => transaction.signature !== signature
      ),
    })
  );

  readonly markAsViewed = this.updater((state) => {
    return {
      ...state,
      viewedTransactionSignatures: state.viewedTransactionSignatures.concat(
        state.transactions
          .filter((transaction) => transaction.status === 'finalized')
          .map((transaction) => transaction.signature)
      ),
    };
  });

  private readonly _handleTransaction = this.effect<TransactionStatus>(
    tap((transaction) => {
      if (transaction.error !== undefined) {
        this._removeTransaction(transaction.signature);
      } else {
        this._addTransaction(transaction);
      }
    })
  );

  private readonly _registerTopic = this.effect<{
    connected: boolean;
    topicName: string | null;
  }>(
    tapEffect(({ connected, topicName }) => {
      if (!connected || topicName === null) {
        return noop;
      }

      this.patchState({ transactions: List() });

      this._hdBroadcasterSocketStore.send(
        JSON.stringify({
          event: 'subscribe',
          data: topicName,
        })
      );

      return () => {
        this._hdBroadcasterSocketStore.send(
          JSON.stringify({
            event: 'unsubscribe',
            data: topicName,
          })
        );
      };
    })
  );
}
