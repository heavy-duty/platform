import { Injectable } from '@angular/core';
import {
  createCreateInstructionRelationTransaction,
  createDeleteInstructionRelationTransaction,
  createUpdateInstructionRelationTransaction,
  findInstructionRelationAddress,
  fromInstructionRelationChange,
  fromInstructionRelationCreated,
  getInstructionRelations,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { PublicKey } from '@solana/web3.js';
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
  instructionRelationsMap: Map<string, Relation<InstructionRelation>>;
}

const initialState: ViewModel = {
  instructionRelationsMap: new Map<string, Relation<InstructionRelation>>(),
};

@Injectable()
export class InstructionRelationStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  readonly instructionRelationsMap$ = this.select(
    ({ instructionRelationsMap }) => instructionRelationsMap
  );
  readonly instructionRelations$ = this.select(
    this.instructionRelationsMap$,
    (instructionRelationsMap) =>
      Array.from(
        instructionRelationsMap,
        ([, instructionRelation]) => instructionRelation
      )
  );

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
    super(initialState);
  }

  private readonly _setInstructionRelation = this.updater(
    (state, newInstructionRelation: Relation<InstructionRelation>) => {
      const instructionRelationsMap = new Map(state.instructionRelationsMap);
      instructionRelationsMap.set(
        newInstructionRelation.id,
        newInstructionRelation
      );
      return {
        ...state,
        instructionRelationsMap,
      };
    }
  );

  private readonly _addInstructionRelation = this.updater(
    (state, newInstructionRelation: Relation<InstructionRelation>) => {
      if (state.instructionRelationsMap.has(newInstructionRelation.id)) {
        return state;
      }
      const instructionRelationsMap = new Map(state.instructionRelationsMap);
      instructionRelationsMap.set(
        newInstructionRelation.id,
        newInstructionRelation
      );
      return {
        ...state,
        instructionRelationsMap,
      };
    }
  );

  private readonly _removeInstructionRelation = this.updater(
    (state, instructionRelationId: string) => {
      const instructionRelationsMap = new Map(state.instructionRelationsMap);
      instructionRelationsMap.delete(instructionRelationId);
      return {
        ...state,
        instructionRelationsMap,
      };
    }
  );

  readonly onInstructionRelationChanges = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this.instructionRelations$,
    ]).pipe(
      switchMap(([connection, instructionRelations]) => {
        if (!connection) {
          return of(null);
        }

        return merge(
          ...instructionRelations.map((instructionRelation) =>
            fromInstructionRelationChange(
              connection,
              new PublicKey(instructionRelation.id)
            ).pipe(
              tap((changes) => {
                if (!changes) {
                  this._removeInstructionRelation(instructionRelation.id);
                } else {
                  this._setInstructionRelation(changes);
                }
              })
            )
          )
        );
      })
    )
  );

  readonly onInstructionRelationCreated = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
      this.instructionRelations$,
    ]).pipe(
      switchMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return EMPTY;
        }

        return fromInstructionRelationCreated(connection, {
          workspace: workspaceId,
        }).pipe(
          tap((instructionRelation) =>
            this._addInstructionRelation(instructionRelation)
          )
        );
      })
    )
  );

  readonly loadInstructionRelations = this.effect(($) =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
      $,
    ]).pipe(
      concatMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return of([]);
        }

        return getInstructionRelations(connection, {
          workspace: workspaceId,
        }).pipe(
          catchError((error) => {
            console.error(error);
            return EMPTY;
          })
        );
      }),
      tap((instructionRelations) =>
        this.patchState({
          instructionRelationsMap: instructionRelations.reduce(
            (instructionRelationsMap, instructionRelation) =>
              instructionRelationsMap.set(
                instructionRelation.id,
                instructionRelation
              ),
            new Map<string, Relation<InstructionRelation>>()
          ),
        })
      )
    )
  );

  readonly createInstructionRelation = this.effect(
    (
      request$: Observable<{
        from: string;
        to: string;
        instructionRelationId: string;
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
            { from, to, applicationId, instructionRelationId },
          ]) => {
            if (!connection || !authority || !workspaceId) {
              return of(null);
            }

            return findInstructionRelationAddress(
              new PublicKey(from),
              new PublicKey(to)
            ).pipe(
              concatMap(
                ([instructionRelationPublicKey, instructionRelationBump]) =>
                  createCreateInstructionRelationTransaction(
                    connection,
                    authority,
                    new PublicKey(workspaceId),
                    new PublicKey(applicationId),
                    new PublicKey(instructionRelationId),
                    instructionRelationPublicKey,
                    instructionRelationBump,
                    new PublicKey(from),
                    new PublicKey(to)
                  ).pipe(
                    this._bulldozerProgramStore.signSendAndConfirmTransactions(
                      connection
                    )
                  )
              )
            );
          }
        )
      )
  );

  readonly updateInstructionRelation = this.effect(
    (
      request$: Observable<{
        instructionRelationId: string;
        from: string;
        to: string;
      }>
    ) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([connection, authority, { instructionRelationId, from, to }]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createUpdateInstructionRelationTransaction(
              connection,
              authority,
              new PublicKey(instructionRelationId),
              new PublicKey(from),
              new PublicKey(to)
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              )
            );
          }
        )
      )
  );

  readonly deleteInstructionRelation = this.effect(
    (
      request$: Observable<{
        from: string;
        to: string;
        instructionRelationId: string;
      }>
    ) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([connection, authority, { from, to, instructionRelationId }]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createDeleteInstructionRelationTransaction(
              connection,
              authority,
              new PublicKey(from),
              new PublicKey(to),
              new PublicKey(instructionRelationId)
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
