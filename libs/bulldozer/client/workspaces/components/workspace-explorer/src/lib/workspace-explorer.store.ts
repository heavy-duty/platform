import { Injectable } from '@angular/core';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import {
  HdBroadcasterSocketStore,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import {
  Document,
  flattenInstructions,
  InstructionStatus,
  Workspace,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined, isTruthy, tapEffect } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List } from 'immutable';
import { map, noop, switchMap, tap } from 'rxjs';
import { reduceInstructions } from './reduce-workspace-instructions';
import { WorkspaceItemView } from './types';

const documentToView = (document: Document<Workspace>): WorkspaceItemView => {
  return {
    id: document.id,
    name: document.name,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
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
export class WorkspaceExplorerStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  private readonly _topicName$ = this.select(
    this.workspaceId$.pipe(isNotNullOrUndefined),
    (workspaceId) => `workspace:${workspaceId}`
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
  readonly workspace$ = this.select(
    this._workspaceStore.workspace$,
    this._instructionStatuses$,
    (workspace, instructionStatuses) =>
      instructionStatuses.reduce(
        reduceInstructions,
        workspace === null ? null : documentToView(workspace)
      ),
    { debounce: true }
  );

  constructor(
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _workspaceStore: WorkspaceStore
  ) {
    super(initialState);

    this._workspaceStore.setWorkspaceId(
      this.select(
        this.workspaceId$.pipe(isNotNullOrUndefined),
        this._hdBroadcasterSocketStore.connected$.pipe(isTruthy),
        (workspaceId) => workspaceId
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
