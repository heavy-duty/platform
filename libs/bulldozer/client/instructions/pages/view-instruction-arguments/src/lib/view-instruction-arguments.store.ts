import { Injectable } from '@angular/core';
import { InstructionArgumentsStore } from '@bulldozer-client/instructions-data-access';
import {
  HdBroadcasterSocketStore,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import { isNotNullOrUndefined, isTruthy, tapEffect } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { TransactionSignature } from '@solana/web3.js';
import { List } from 'immutable';
import { map, noop, switchMap, tap } from 'rxjs';
import { documentToView } from './document-to-view';
import { reduceInstructions } from './reduce-instructions';
import { flattenInstructions, InstructionStatus } from './utils';

interface ViewModel {
  instructionId: string | null;
  transactions: List<TransactionStatus>;
}

const initialState: ViewModel = {
  instructionId: null,
  transactions: List(),
};

@Injectable()
export class ViewInstructionArgumentsStore extends ComponentStore<ViewModel> {
  private readonly _instructionId$ = this.select(
    ({ instructionId }) => instructionId
  );
  private readonly _topicName$ = this.select(
    this._instructionId$.pipe(isNotNullOrUndefined),
    (instructionId) => `instructionArguments:${instructionId}`
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
  readonly instructionArguments$ = this.select(
    this._instructionArgumentsStore.instructionArguments$,
    this._instructionStatuses$,
    (instructionsArguments, instructionStatuses) => {
      if (instructionsArguments === null) {
        return null;
      }

      return instructionStatuses.reduce(
        reduceInstructions,
        instructionsArguments.map(documentToView)
      );
    },
    { debounce: true }
  );

  constructor(
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _instructionArgumentsStore: InstructionArgumentsStore
  ) {
    super(initialState);

    this._instructionArgumentsStore.setFilters(
      this.select(
        this._instructionId$.pipe(isNotNullOrUndefined),
        this._hdBroadcasterSocketStore.connected$.pipe(isTruthy),
        (instructionId) => ({ instruction: instructionId })
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
        this._instructionArgumentsStore.instructionArguments$.pipe(
          isNotNullOrUndefined
        ),
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
