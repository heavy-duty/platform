import { Injectable } from '@angular/core';
import { InstructionArgumentsStore } from '@bulldozer-client/instructions-data-access';
import {
  flattenInstructions,
  HdBroadcasterSocketStore,
  InstructionStatus,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import { isNotNullOrUndefined, tapEffect } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { map, noop, switchMap } from 'rxjs';
import { documentToView } from './document-to-view';
import { reduceInstructions } from './reduce-instructions';

interface ViewModel {
  instructionId: string | null;
  pendingTransactions: TransactionStatus[] | null;
  transactions: TransactionStatus[];
}

const initialState: ViewModel = {
  instructionId: null,
  pendingTransactions: null,
  transactions: [],
};

@Injectable()
export class ViewInstructionArgumentsStore extends ComponentStore<ViewModel> {
  private readonly _instructionId$ = this.select(
    ({ instructionId }) => instructionId
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
      this._instructionId$.pipe(
        isNotNullOrUndefined,
        map((instruction) => ({ instruction }))
      )
    );
    this._addTransaction(
      this._instructionId$.pipe(
        isNotNullOrUndefined,
        switchMap((instructionId) =>
          this._hdBroadcasterSocketStore
            .fromEvent(instructionId)
            .pipe(map((message) => message.data))
        )
      )
    );
    this._registerTopic(
      this.select(
        this._hdBroadcasterSocketStore.connected$,
        this._instructionId$,
        this._instructionArgumentsStore.instructionArguments$.pipe(
          isNotNullOrUndefined
        ),
        (connected, instructionId) => ({
          connected,
          instructionId,
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

  private readonly _addTransaction = this.updater<TransactionStatus>(
    (state, transaction) => ({
      ...state,
      transactions: [...state.transactions, transaction],
    })
  );

  private readonly _registerTopic = this.effect<{
    connected: boolean;
    instructionId: string | null;
  }>(
    tapEffect(({ connected, instructionId }) => {
      if (!connected || instructionId === null) {
        return noop;
      }

      this.patchState({ transactions: [] });

      this._hdBroadcasterSocketStore.send(
        JSON.stringify({
          event: 'subscribe',
          data: instructionId,
        })
      );

      return () => {
        this._hdBroadcasterSocketStore.send(
          JSON.stringify({
            event: 'unsubscribe',
            data: instructionId,
          })
        );
      };
    })
  );
}
