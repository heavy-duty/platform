import { Injectable } from '@angular/core';
import { CollectionStore } from '@bulldozer-client/collections-data-access';
import {
  HdBroadcasterSocketStore,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import {
  Collection,
  Document,
  flattenInstructions,
  InstructionStatus,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined, isTruthy } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List } from 'immutable';
import { EMPTY, switchMap, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { reduceInstructions } from './reduce-instructions';
import { CollectionItemView } from './types';

const documentToView = (document: Document<Collection>): CollectionItemView => {
  return {
    id: document.id,
    name: document.name,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    applicationId: document.data.application,
    workspaceId: document.data.workspace,
  };
};

interface ViewModel {
  collectionId: string | null;
  transactions: List<TransactionStatus>;
}

const initialState: ViewModel = {
  collectionId: null,
  transactions: List(),
};

@Injectable()
export class ViewCollectionStore extends ComponentStore<ViewModel> {
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  private readonly _topicName$ = this.select(
    this.collectionId$.pipe(isNotNullOrUndefined),
    (collectionId) => `collections:${collectionId}`
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
  readonly collection$ = this.select(
    this._collectionStore.collection$,
    this._instructionStatuses$,
    (collection, instructionStatuses) =>
      instructionStatuses.reduce(
        reduceInstructions,
        collection === null ? null : documentToView(collection)
      ),
    { debounce: true }
  );

  constructor(
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _collectionStore: CollectionStore
  ) {
    super(initialState);

    this._collectionStore.setCollectionId(
      this.select(
        this.collectionId$.pipe(isNotNullOrUndefined),
        this._hdBroadcasterSocketStore.connected$.pipe(isTruthy),
        (collectionId) => collectionId
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

  readonly setCollectionId = this.updater<string | null>(
    (state, collectionId) => ({
      ...state,
      collectionId,
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
