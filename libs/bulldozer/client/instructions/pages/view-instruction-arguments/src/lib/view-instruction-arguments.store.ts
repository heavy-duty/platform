import { Injectable } from '@angular/core';
import { InstructionArgumentsStore } from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  flattenInstructions,
  HdBroadcasterSocketStore,
  InstructionStatus,
  TransactionStatus,
} from '@heavy-duty/broadcaster';
import { HdSolanaApiService } from '@heavy-duty/ngx-solana';
import { isNotNullOrUndefined, tapEffect } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Finality } from '@solana/web3.js';
import { concatMap, EMPTY, map, switchMap } from 'rxjs';
import { documentToView } from './document-to-view';
import { reduceInstructions } from './reduce-instructions';

interface ViewModel {
  instructionId: string | null;
  pendingTransactions: TransactionStatus[] | null;
  currentTransactions: TransactionStatus[];
}

const initialState: ViewModel = {
  instructionId: null,
  pendingTransactions: null,
  currentTransactions: [],
};

@Injectable()
export class ViewInstructionArgumentsStore extends ComponentStore<ViewModel> {
  private readonly _instructionId$ = this.select(
    ({ instructionId }) => instructionId
  );
  private readonly _pendingTransactions$ = this.select(
    ({ pendingTransactions }) => pendingTransactions
  );
  private readonly _currentTransactions$ = this.select(
    ({ currentTransactions }) => currentTransactions
  );
  private readonly _instructionStatuses$ = this.select(
    this._pendingTransactions$.pipe(isNotNullOrUndefined),
    this._currentTransactions$,
    (pendingTransactions, currentTransactions) => {
      const pendingInstructionStatuses = pendingTransactions.reduce<
        InstructionStatus[]
      >(
        (pendingInstructions, transactionStatus) =>
          pendingInstructions.concat(flattenInstructions(transactionStatus)),
        []
      );

      const currentInstructionStatuses = currentTransactions.reduce<
        InstructionStatus[]
      >(
        (currentInstructions, transactionStatus) =>
          currentInstructions.concat(flattenInstructions(transactionStatus)),
        []
      );

      return [...pendingInstructionStatuses, ...currentInstructionStatuses];
    }
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
    }
  );
  readonly loading$ = this.select(
    this._instructionArgumentsStore.loading$,
    this._pendingTransactions$,
    (loadingInstructionArguments, pendingTransactions) =>
      loadingInstructionArguments || pendingTransactions === null
  );

  constructor(
    private readonly _hdSolanaApiService: HdSolanaApiService,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _notificationStore: NotificationStore,
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
    this._loadPendingTransactions(this._instructionId$);
    this._registerTopic(this._instructionId$);
  }

  readonly setInstructionId = this.updater<string | null>(
    (state, instructionId) => ({ ...state, instructionId })
  );

  private readonly _addTransaction = this.updater<TransactionStatus>(
    (state, transaction) => ({
      ...state,
      currentTransactions: [...state.currentTransactions, transaction],
    })
  );

  private readonly _registerTopic = this.effect<string | null>(
    tapEffect((instructionId) => {
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

  private readonly _loadPendingTransactions = this.effect<string | null>(
    concatMap((instructionId) => {
      if (instructionId === null) {
        return EMPTY;
      }

      this.patchState({
        pendingTransactions: null,
        currentTransactions: [],
      });

      return this._hdSolanaApiService
        .getConfirmedTransactionsByAddress(instructionId)
        .pipe(
          tapResponse(
            (transactions) =>
              this.patchState({
                pendingTransactions: transactions.map((transaction) => ({
                  signature: transaction.signature,
                  timestamp: Date.now(),
                  status: 'confirmed' as Finality,
                  transactionResponse: {
                    meta: transaction.transactionResponse.meta,
                    slot: transaction.transactionResponse.slot,
                    blockTime: transaction.transactionResponse.blockTime,
                    transaction: {
                      signatures:
                        transaction.transactionResponse.transaction.signatures
                          .map((signature) => signature.signature?.toString())
                          .filter(
                            (signature): signature is string =>
                              signature !== undefined
                          ),
                      message:
                        transaction.transactionResponse.transaction.compileMessage(),
                    },
                  },
                })),
              }),
            (error) => this._notificationStore.setError(error)
          )
        );
    })
  );
}
