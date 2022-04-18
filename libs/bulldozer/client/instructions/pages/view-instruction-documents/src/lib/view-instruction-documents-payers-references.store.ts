import { Injectable } from '@angular/core';
import { InstructionAccountPayersStore } from '@bulldozer-client/instructions-data-access';
import {
  HdBroadcasterSocketStore,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import {
  Document,
  flattenInstructions,
  InstructionAccountPayer,
  InstructionStatus,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List } from 'immutable';
import { EMPTY, switchMap, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { reduceInstructions } from './reduce-account-payer-instructions';
import { InstructionAccountPayerItemView } from './types';

const documentToView = (
  instructionAccountPayer: Document<InstructionAccountPayer>
): InstructionAccountPayerItemView => {
  return {
    id: instructionAccountPayer.id,
    payer: instructionAccountPayer.data.payer,
    isUpdating: false,
  };
};

interface ViewModel {
  instructionId: string | null;
  instructionAccountPayerIds: List<string> | null;
  transactions: List<TransactionStatus>;
}

const initialState: ViewModel = {
  instructionId: null,
  instructionAccountPayerIds: null,
  transactions: List(),
};

@Injectable()
export class ViewInstructionDocumentsPayersReferencesStore extends ComponentStore<ViewModel> {
  private readonly _instructionId$ = this.select(
    ({ instructionId }) => instructionId
  );
  private readonly _instructionAccountPayerIds$ = this.select(
    ({ instructionAccountPayerIds }) => instructionAccountPayerIds
  );
  private readonly _topicName$ = this.select(
    this._instructionId$.pipe(isNotNullOrUndefined),
    (instructionId) => `instructions:${instructionId}:accounts`
  );
  private readonly _instructionStatuses$ = this.select(
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
  readonly accounts$ = this.select(
    this._instructionAccountPayersStore.instructionAccountPayers$,
    this._instructionStatuses$,
    (instructionAccountPayers, instructionStatuses) => {
      if (instructionAccountPayers === null) {
        return null;
      }

      return instructionStatuses.reduce(
        reduceInstructions,
        instructionAccountPayers.map(documentToView)
      );
    },
    { debounce: true }
  );

  constructor(
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _instructionAccountPayersStore: InstructionAccountPayersStore
  ) {
    super(initialState);

    this._instructionAccountPayersStore.setInstructionAccountPayerIds(
      this._instructionAccountPayerIds$
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

  readonly setInstructionId = this.updater<string | null>(
    (state, instructionId) => ({
      ...state,
      instructionId,
    })
  );

  readonly setInstructionAccountPayerIds = this.updater<List<string> | null>(
    (state, instructionAccountPayerIds) => ({
      ...state,
      instructionAccountPayerIds,
    })
  );

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
