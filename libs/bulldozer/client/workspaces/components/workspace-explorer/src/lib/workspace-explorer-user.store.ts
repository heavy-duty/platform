import { Injectable } from '@angular/core';
import { UserStore } from '@bulldozer-client/users-data-access';
import {
  HdBroadcasterSocketStore,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import {
  Document,
  flattenInstructions,
  InstructionStatus,
  User,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined, isTruthy, tapEffect } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List } from 'immutable';
import { map, noop, switchMap, tap } from 'rxjs';
import { reduceInstructions } from './reduce-user-instructions';
import { UserItemView } from './types';

const documentToView = (document: Document<User>): UserItemView => {
  return {
    id: document.id,
    name: document.name,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    userName: document.data.userName,
    thumbnailUrl: document.data.thumbnailUrl,
    authority: document.data.authority,
    createdAt: document.createdAt.toNumber() * 1000,
  };
};

interface ViewModel {
  authority: string | null;
  transactions: List<TransactionStatus>;
}

const initialState: ViewModel = {
  authority: null,
  transactions: List(),
};

@Injectable()
export class WorkspaceExplorerUserStore extends ComponentStore<ViewModel> {
  readonly authority$ = this.select(({ authority }) => authority);
  private readonly _topicName$ = this.select(
    this.authority$.pipe(isNotNullOrUndefined),
    (authority) => `authority:${authority}`
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
  readonly user$ = this.select(
    this._userStore.user$,
    this._instructionStatuses$,
    (user, instructionStatuses) =>
      instructionStatuses.reduce(
        reduceInstructions,
        user === null ? null : documentToView(user)
      ),
    { debounce: true }
  );

  constructor(
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _userStore: UserStore
  ) {
    super(initialState);

    this._userStore.setAuthority(
      this.select(
        this.authority$.pipe(isNotNullOrUndefined),
        this._hdBroadcasterSocketStore.connected$.pipe(isTruthy),
        (authority) => authority
      )
    );
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

  readonly setAuthority = this.updater<string | null>((state, authority) => ({
    ...state,
    authority,
  }));

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
