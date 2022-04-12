import { Injectable } from '@angular/core';
import { InstructionArgumentsStore } from '@bulldozer-client/instructions-data-access';
import {
  HdBroadcasterSocketStore,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import { isNotNullOrUndefined, isTruthy, tapEffect } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { map, noop, switchMap } from 'rxjs';
import { documentToView } from './document-to-view';
import { reduceInstructions } from './reduce-instructions';
import { flattenInstructions, InstructionStatus } from './utils';

interface ViewModel {
  instructionId: string | null;
  transactions: TransactionStatus[];
}

const initialState: ViewModel = {
  instructionId: null,
  transactions: [],
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
        .reduce<InstructionStatus[]>(
          (currentInstructions, transactionStatus) =>
            currentInstructions.concat(flattenInstructions(transactionStatus)),
          []
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
      if (instructionsArguments === null || instructionStatuses === null) {
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

  readonly setInstructionId = this.updater<string | null>(
    (state, instructionId) => ({
      ...state,
      instructionId,
    })
  );

  private readonly _handleTransaction = this.updater<TransactionStatus>(
    (state, newTransaction) => {
      if (newTransaction.error !== undefined) {
        return {
          ...state,
          transactions: state.transactions.filter(
            (transaction) => transaction.signature !== newTransaction.signature
          ),
        };
      }

      return {
        ...state,
        transactions: [...state.transactions, newTransaction],
      };
    }
  );

  private readonly _registerTopic = this.effect<{
    connected: boolean;
    topicName: string | null;
  }>(
    tapEffect(({ connected, topicName }) => {
      if (!connected || topicName === null) {
        return noop;
      }

      this.patchState({ transactions: [] });

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
