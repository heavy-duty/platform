import { Injectable } from '@angular/core';
import {
  createCreateInstructionTransaction,
  createDeleteInstructionTransaction,
  createUpdateInstructionBodyTransaction,
  createUpdateInstructionTransaction,
  Document,
  fromInstructionChange,
  fromInstructionCreated,
  getInstructions,
  Instruction,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  catchError,
  combineLatest,
  concatMap,
  EMPTY,
  merge,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { BulldozerProgramStore } from './bulldozer-program.store';
import { ConnectionStore } from './connection-store';

interface ViewModel {
  instructionsMap: Map<string, Document<Instruction>>;
  error?: unknown;
}

const initialState: ViewModel = {
  instructionsMap: new Map<string, Document<Instruction>>(),
};

@Injectable()
export class InstructionStore extends ComponentStore<ViewModel> {
  readonly error$ = this.select(({ error }) => error);
  readonly instructionsMap$ = this.select(
    ({ instructionsMap }) => instructionsMap
  );
  readonly instructions$ = this.select(
    this.instructionsMap$,
    (instructionsMap) =>
      Array.from(instructionsMap, ([, instruction]) => instruction)
  );

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
    super(initialState);
  }

  private readonly _setInstruction = this.updater(
    (state, newInstruction: Document<Instruction>) => {
      const instructionsMap = new Map(state.instructionsMap);
      instructionsMap.set(newInstruction.id, newInstruction);
      return {
        ...state,
        instructionsMap,
      };
    }
  );

  private readonly _addInstruction = this.updater(
    (state, newInstruction: Document<Instruction>) => {
      if (state.instructionsMap.has(newInstruction.id)) {
        return state;
      }
      const instructionsMap = new Map(state.instructionsMap);
      instructionsMap.set(newInstruction.id, newInstruction);
      return {
        ...state,
        instructionsMap,
      };
    }
  );

  private readonly _removeInstruction = this.updater(
    (state, instructionId: string) => {
      const instructionsMap = new Map(state.instructionsMap);
      instructionsMap.delete(instructionId);
      return {
        ...state,
        instructionsMap,
      };
    }
  );

  private readonly _setError = this.updater((state, error: unknown) => ({
    ...state,
    error,
  }));

  readonly onInstructionChanges = this.effect(() =>
    combineLatest([this._connectionStore.connection$, this.instructions$]).pipe(
      switchMap(([connection, instructions]) => {
        if (!connection) {
          return of(null);
        }

        return merge(
          ...instructions.map((instruction) =>
            fromInstructionChange(
              connection,
              new PublicKey(instruction.id)
            ).pipe(
              tapResponse(
                (changes) => {
                  if (!changes) {
                    this._removeInstruction(instruction.id);
                  } else {
                    this._setInstruction(changes);
                  }
                },
                (error) => this._setError(error)
              )
            )
          )
        );
      })
    )
  );

  readonly onInstructionCreated = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
      this.instructions$,
    ]).pipe(
      switchMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return EMPTY;
        }

        return fromInstructionCreated(connection, {
          workspace: workspaceId,
        }).pipe(
          tapResponse(
            (instruction) => this._addInstruction(instruction),
            (error) => this._setError(error)
          )
        );
      })
    )
  );

  readonly loadInstructions = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
    ]).pipe(
      concatMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return of([]);
        }

        return getInstructions(connection, {
          workspace: workspaceId,
        });
      }),
      tapResponse(
        (instructions) =>
          this.patchState({
            instructionsMap: instructions.reduce(
              (instructionsMap, instruction) =>
                instructionsMap.set(instruction.id, instruction),
              new Map<string, Document<Instruction>>()
            ),
          }),
        (error) => this._setError(error)
      )
    )
  );

  readonly createInstruction = this.effect(
    (
      request$: Observable<{ instructionName: string; applicationId: string }>
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
            { instructionName, applicationId },
          ]) => {
            if (!connection || !authority || !workspaceId) {
              return of(null);
            }

            const instructionKeypair = new Keypair();

            return createCreateInstructionTransaction(
              connection,
              authority,
              new PublicKey(workspaceId),
              new PublicKey(applicationId),
              instructionKeypair,
              instructionName
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              ),
              catchError((error) => {
                this._setError(error);
                return EMPTY;
              })
            );
          }
        )
      )
  );

  readonly updateInstruction = this.effect(
    (
      request$: Observable<{ instructionId: string; instructionName: string }>
    ) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([connection, authority, { instructionId, instructionName }]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createUpdateInstructionTransaction(
              connection,
              authority,
              new PublicKey(instructionId),
              instructionName
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              ),
              catchError((error) => {
                this._setError(error);
                return EMPTY;
              })
            );
          }
        )
      )
  );

  readonly updateInstructionBody = this.effect(
    (
      request$: Observable<{ instructionId: string; instructionBody: string }>
    ) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([connection, authority, { instructionId, instructionBody }]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createUpdateInstructionBodyTransaction(
              connection,
              authority,
              new PublicKey(instructionId),
              instructionBody
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              ),
              catchError((error) => {
                this._setError(error);
                return EMPTY;
              })
            );
          }
        )
      )
  );

  readonly deleteInstruction = this.effect(
    (request$: Observable<{ instructionId: string; applicationId: string }>) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([connection, authority, { instructionId, applicationId }]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createDeleteInstructionTransaction(
              connection,
              authority,
              new PublicKey(applicationId),
              new PublicKey(instructionId)
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              ),
              catchError((error) => {
                this._setError(error);
                return EMPTY;
              })
            );
          }
        )
      )
  );
}
