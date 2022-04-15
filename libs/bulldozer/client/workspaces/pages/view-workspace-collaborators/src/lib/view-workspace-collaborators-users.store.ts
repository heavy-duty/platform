import { Injectable } from '@angular/core';
import { UsersStore } from '@bulldozer-client/users-data-access';
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
import { isNotNullOrUndefined, tapEffect } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List, Set } from 'immutable';
import { map, merge, noop, switchMap, tap } from 'rxjs';
import { reduceInstructions } from './reduce-user-instructions';
import { UserItemView } from './types';

const documentToView = (user: Document<User>): UserItemView => {
  return {
    id: user.id,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    name: user.name,
    userName: user.data.userName,
    thumbnailUrl: user.data.thumbnailUrl,
    authority: user.data.authority,
  };
};

interface ViewModel {
  userIds: Set<string> | null;
  transactions: List<TransactionStatus>;
}

const initialState: ViewModel = {
  userIds: null,
  transactions: List(),
};

@Injectable()
export class ViewWorkspaceCollaboratorsUsersStore extends ComponentStore<ViewModel> {
  private readonly _userIds$ = this.select(({ userIds }) => userIds);
  private readonly _instructionStatuses$ = this.select(
    this.select(({ transactions }) => transactions),
    (transactions) => {
      return transactions
        .reduce(
          (currentInstructions, transactionStatus) =>
            currentInstructions.concat(flattenInstructions(transactionStatus)),
          List<InstructionStatus>()
        )
        .sort(
          (a, b) =>
            a.transactionStatus.timestamp - b.transactionStatus.timestamp
        );
    }
  );
  readonly usersMap$ = this.select(
    this._usersStore.usersMap$,
    this._instructionStatuses$,
    (users, instructionStatuses) => {
      if (users === null) {
        return null;
      }

      return instructionStatuses.reduce(
        reduceInstructions,
        users.map(documentToView)
      );
    }
  );
  private readonly _topicNames$ = this.select(
    this._userIds$,
    (userIds) =>
      userIds?.reduce<string[]>(
        (topicNames, userId) => [...topicNames, `user:${userId}`],
        []
      ) ?? null
  );

  constructor(
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _usersStore: UsersStore
  ) {
    super(initialState);

    this._usersStore.setUserIds(this._userIds$);
    this._handleTransaction(
      this._topicNames$.pipe(
        isNotNullOrUndefined,
        switchMap((topicNames) =>
          merge(
            ...topicNames.map((topicName) =>
              this._hdBroadcasterSocketStore
                .fromEvent(topicName)
                .pipe(map((message) => message.data))
            )
          )
        )
      )
    );
    this._registerTopics(
      this.select(
        this._hdBroadcasterSocketStore.connected$,
        this._topicNames$,
        (connected, topicNames) => ({
          connected,
          topicNames,
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

  readonly setUserIds = this.updater<List<string> | string[] | null>(
    (state, userIds) => ({
      ...state,
      userIds: userIds ? Set(userIds) : null,
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

  private readonly _registerTopics = this.effect<{
    connected: boolean;
    topicNames: string[] | null;
  }>(
    tapEffect(({ connected, topicNames }) => {
      if (!connected || topicNames === null) {
        return noop;
      }

      this.patchState({ transactions: List() });

      topicNames.forEach((topicName) => {
        this._hdBroadcasterSocketStore.send(
          JSON.stringify({
            event: 'subscribe',
            data: topicName,
          })
        );
      });

      return () => {
        topicNames.forEach((topicName) => {
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'unsubscribe',
              data: topicName,
            })
          );
        });
      };
    })
  );
}
