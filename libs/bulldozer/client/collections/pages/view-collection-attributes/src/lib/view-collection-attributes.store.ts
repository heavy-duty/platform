import { Injectable } from '@angular/core';
import { CollectionAttributesStore } from '@bulldozer-client/collections-data-access';
import {
  HdBroadcasterSocketStore,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import {
  CollectionAttribute,
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
import { CollectionAttributeItemView } from './types';

const documentToView = (
  document: Document<CollectionAttribute>
): CollectionAttributeItemView => {
  return {
    id: document.id,
    name: document.name,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    kind: document.data.kind,
    modifier: document.data.modifier,
    collectionId: document.data.collection,
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
export class ViewCollectionAttributesStore extends ComponentStore<ViewModel> {
  private readonly _collectionId$ = this.select(
    ({ collectionId }) => collectionId
  );
  private readonly _topicName$ = this.select(
    this._collectionId$.pipe(isNotNullOrUndefined),
    (collectionId) => `collections:${collectionId}:attributes`
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
  readonly collectionAttributes$ = this.select(
    this._collectionAttributesStore.collectionAttributes$,
    this._instructionStatuses$,
    (collectionAttributes, instructionStatuses) => {
      if (collectionAttributes === null) {
        return null;
      }

      return instructionStatuses.reduce(
        reduceInstructions,
        collectionAttributes.map(documentToView)
      );
    },
    { debounce: true }
  );

  constructor(
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _collectionAttributesStore: CollectionAttributesStore
  ) {
    super(initialState);

    this._collectionAttributesStore.setFilters(
      this.select(
        this._collectionId$.pipe(isNotNullOrUndefined),
        this._hdBroadcasterSocketStore.connected$.pipe(isTruthy),
        (collectionId) => ({ collection: collectionId })
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
