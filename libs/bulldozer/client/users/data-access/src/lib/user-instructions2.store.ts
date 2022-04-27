import { Injectable } from '@angular/core';
import {
  HdBroadcasterSocketStore,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import {
  flattenInstructions,
  InstructionStatus,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List, Map, Set } from 'immutable';
import { EMPTY, switchMap, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';

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
    this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    (walletPublicKey) => `authority:${walletPublicKey}`
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
            groupedInstructionStatuses.set(
              instructionStatus.id,
              instructionStatus
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
    switchMap(({ connected, topicName }) => {
      if (!connected || topicName === null) {
        return EMPTY;
      }

      this.patchState({ transactions: List() });

      const correlationId = uuid();
      let subscriptionId: string;

      return this._hdBroadcasterSocketStore
        .multiplex(
          () => ({
            event: 'subscribe',
            data: {
              topicName,
              correlationId,
            },
          }),
          () => ({
            event: 'unsubscribe',
            data: { topicName, subscriptionId },
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (message: any) => {
            if (
              typeof message === 'object' &&
              message !== null &&
              'data' in message &&
              'id' in message.data &&
              'subscriptionId' in message.data &&
              message.data.id === correlationId
            ) {
              subscriptionId = message.data.subscriptionId;
            }

            return (
              message.data.subscriptionId === subscriptionId &&
              message.data.topicName === topicName
            );
          }
        )
        .pipe(
          tap((message) => {
            if (message.data.transactionStatus) {
              this._handleTransaction(message.data.transactionStatus);
            }
          })
        );
    })
  );
}
