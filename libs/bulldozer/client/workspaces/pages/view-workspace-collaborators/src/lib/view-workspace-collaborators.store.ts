import { Injectable } from '@angular/core';
import { CollaboratorsStore } from '@bulldozer-client/collaborators-data-access';
import {
  HdBroadcasterSocketStore,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import {
  Collaborator,
  Document,
  flattenInstructions,
  InstructionStatus,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined, isTruthy, tapEffect } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List } from 'immutable';
import { map, merge, noop, switchMap, tap } from 'rxjs';
import { reduceInstructions } from './reduce-collaborator-instructions';
import { CollaboratorItemView } from './types';

const documentToView = (
  collaborator: Document<Collaborator>
): CollaboratorItemView => {
  return {
    id: collaborator.id,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    userId: collaborator.data.user,
    workspaceId: collaborator.data.workspace,
    isAdmin: collaborator.data.isAdmin,
    authority: collaborator.data.authority,
    status: collaborator.data.status,
    createdAt: collaborator.createdAt.toNumber() * 1000,
  };
};

interface ViewModel {
  workspaceId: string | null;
  transactions: List<TransactionStatus>;
}

const initialState: ViewModel = {
  workspaceId: null,
  transactions: List(),
};

@Injectable()
export class ViewWorkspaceCollaboratorsStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
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
  readonly collaboratorsMap$ = this.select(
    this._collaboratorsStore.collaboratorsMap$,
    this._instructionStatuses$,
    (collaborators, instructionStatuses) => {
      if (collaborators === null) {
        return null;
      }

      return instructionStatuses.reduce(
        reduceInstructions,
        collaborators.map(documentToView)
      );
    }
  );
  private readonly _topicNames$ = this.select(
    this.workspaceId$.pipe(isNotNullOrUndefined),
    (workspaceId) => [`workspace:${workspaceId}:collaborators`]
  );

  constructor(
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _collaboratorsStore: CollaboratorsStore
  ) {
    super(initialState);

    this._collaboratorsStore.setFilters(
      this.select(
        this.workspaceId$.pipe(isNotNullOrUndefined),
        this._hdBroadcasterSocketStore.connected$.pipe(isTruthy),
        (workspaceId) => ({ workspace: workspaceId })
      )
    );
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

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({
      ...state,
      workspaceId,
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
