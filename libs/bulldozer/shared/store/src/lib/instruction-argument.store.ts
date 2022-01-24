import { Injectable } from '@angular/core';
import {
  createCreateInstructionArgumentTransaction,
  createDeleteInstructionArgumentTransaction,
  createUpdateInstructionArgumentTransaction,
  Document,
  fromInstructionArgumentChange,
  fromInstructionArgumentCreated,
  getInstructionArguments,
  InstructionArgument,
  InstructionArgumentDto,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  catchError,
  combineLatest,
  concatMap,
  EMPTY,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ConnectionStore } from './connection-store';

interface ViewModel {
  instructionArgumentsMap: Map<string, Document<InstructionArgument>>;
}

const initialState: ViewModel = {
  instructionArgumentsMap: new Map<string, Document<InstructionArgument>>(),
};

@Injectable()
export class InstructionArgumentStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  readonly instructionArgumentsMap$ = this.select(
    ({ instructionArgumentsMap }) => instructionArgumentsMap
  );
  readonly instructionArguments$ = this.select(
    this.instructionArgumentsMap$,
    (instructionArgumentsMap) =>
      Array.from(
        instructionArgumentsMap,
        ([, instructionArgument]) => instructionArgument
      )
  );

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
    super(initialState);
  }

  private readonly _setInstructionArgument = this.updater(
    (state, newInstructionArgument: Document<InstructionArgument>) => {
      const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
      instructionArgumentsMap.set(
        newInstructionArgument.id,
        newInstructionArgument
      );
      return {
        ...state,
        instructionArgumentsMap,
      };
    }
  );

  private readonly _addInstructionArgument = this.updater(
    (state, newInstructionArgument: Document<InstructionArgument>) => {
      if (state.instructionArgumentsMap.has(newInstructionArgument.id)) {
        return state;
      }
      const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
      instructionArgumentsMap.set(
        newInstructionArgument.id,
        newInstructionArgument
      );
      return {
        ...state,
        instructionArgumentsMap,
      };
    }
  );

  private readonly _removeInstructionArgument = this.updater(
    (state, instructionArgumentId: string) => {
      const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
      instructionArgumentsMap.delete(instructionArgumentId);
      return {
        ...state,
        instructionArgumentsMap,
      };
    }
  );

  readonly onInstructionArgumentChanges = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this.instructionArguments$,
    ]).pipe(
      switchMap(([connection, instructionArguments]) => {
        if (!connection) {
          return of(null);
        }

        return merge(
          ...instructionArguments.map((instructionArgument) =>
            fromInstructionArgumentChange(
              connection,
              new PublicKey(instructionArgument.id)
            ).pipe(
              tap((changes) => {
                if (!changes) {
                  this._removeInstructionArgument(instructionArgument.id);
                } else {
                  this._setInstructionArgument(changes);
                }
              })
            )
          )
        );
      })
    )
  );

  readonly onInstructionArgumentCreated = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
      this.instructionArguments$,
    ]).pipe(
      switchMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return EMPTY;
        }

        return fromInstructionArgumentCreated(connection, {
          workspace: workspaceId,
        }).pipe(
          tap((instructionArgument) =>
            this._addInstructionArgument(instructionArgument)
          )
        );
      })
    )
  );

  readonly loadInstructionArguments = this.effect(($) =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
      $,
    ]).pipe(
      concatMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return of([]);
        }

        return getInstructionArguments(connection, {
          workspace: workspaceId,
        }).pipe(
          catchError((error) => {
            console.error(error);
            return EMPTY;
          })
        );
      }),
      tap((instructionArguments) =>
        this.patchState({
          instructionArgumentsMap: instructionArguments.reduce(
            (instructionArgumentsMap, instructionArgument) =>
              instructionArgumentsMap.set(
                instructionArgument.id,
                instructionArgument
              ),
            new Map<string, Document<InstructionArgument>>()
          ),
        })
      )
    )
  );

  readonly createInstructionArgument = this.effect(
    (
      request$: Observable<{
        instructionArgumentDto: InstructionArgumentDto;
        instructionArgumentId: string;
        applicationId: string;
      }>
    ) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        this._bulldozerProgramStore.workspaceId$,
        request$,
      ]).pipe(
        concatMap(
          ([
            connection,
            authority,
            workspaceId,
            { instructionArgumentDto, applicationId, instructionArgumentId },
          ]) => {
            if (!connection || !authority || !workspaceId) {
              return of(null);
            }

            const instructionArgumentKeypair = new Keypair();

            return createCreateInstructionArgumentTransaction(
              connection,
              authority,
              new PublicKey(workspaceId),
              new PublicKey(applicationId),
              new PublicKey(instructionArgumentId),
              instructionArgumentKeypair,
              instructionArgumentDto
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              )
            );
          }
        )
      )
  );

  readonly updateInstructionArgument = this.effect(
    (
      request$: Observable<{
        instructionArgumentId: string;
        instructionArgumentDto: InstructionArgumentDto;
      }>
    ) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([
            connection,
            authority,
            { instructionArgumentId, instructionArgumentDto },
          ]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createUpdateInstructionArgumentTransaction(
              connection,
              authority,
              new PublicKey(instructionArgumentId),
              instructionArgumentDto
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              )
            );
          }
        )
      )
  );

  readonly deleteInstructionArgument = this.effect(
    (
      request$: Observable<{
        instructionId: string;
        instructionArgumentId: string;
      }>
    ) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([
            connection,
            authority,
            { instructionId, instructionArgumentId },
          ]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createDeleteInstructionArgumentTransaction(
              connection,
              authority,
              new PublicKey(instructionId),
              new PublicKey(instructionArgumentId)
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              )
            );
          }
        )
      )
  );
}
