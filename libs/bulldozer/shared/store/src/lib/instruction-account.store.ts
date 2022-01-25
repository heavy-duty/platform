import { Injectable } from '@angular/core';
import {
  createCreateInstructionAccountTransaction,
  createDeleteInstructionAccountTransaction,
  createUpdateInstructionAccountTransaction,
  Document,
  fromInstructionAccountChange,
  fromInstructionAccountCreated,
  getInstructionAccounts,
  InstructionAccount,
  InstructionAccountDto,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  combineLatest,
  concatMap,
  EMPTY,
  merge,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import {
  InstructionAccountActions,
  InstructionAccountCreated,
  InstructionAccountDeleted,
  InstructionAccountUpdated,
} from './actions';
import { BulldozerProgramStore } from './bulldozer-program.store';
import { ConnectionStore } from './connection-store';

interface ViewModel {
  error?: unknown;
  event?: InstructionAccountActions;
  instructionAccountsMap: Map<string, Document<InstructionAccount>>;
}

const initialState: ViewModel = {
  instructionAccountsMap: new Map<string, Document<InstructionAccount>>(),
};

@Injectable()
export class InstructionAccountStore extends ComponentStore<ViewModel> {
  readonly event$ = this.select(({ event }) => event);
  readonly error$ = this.select(({ error }) => error);
  readonly instructionAccountsMap$ = this.select(
    ({ instructionAccountsMap }) => instructionAccountsMap
  );
  readonly instructionAccounts$ = this.select(
    this.instructionAccountsMap$,
    (instructionAccountsMap) =>
      Array.from(
        instructionAccountsMap,
        ([, instructionAccount]) => instructionAccount
      )
  );

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
    super(initialState);
  }

  private readonly _setInstructionAccount = this.updater(
    (state, newInstructionAccount: Document<InstructionAccount>) => {
      const instructionAccountsMap = new Map(state.instructionAccountsMap);
      instructionAccountsMap.set(
        newInstructionAccount.id,
        newInstructionAccount
      );
      return {
        ...state,
        instructionAccountsMap,
      };
    }
  );

  private readonly _addInstructionAccount = this.updater(
    (state, newInstructionAccount: Document<InstructionAccount>) => {
      if (state.instructionAccountsMap.has(newInstructionAccount.id)) {
        return state;
      }
      const instructionAccountsMap = new Map(state.instructionAccountsMap);
      instructionAccountsMap.set(
        newInstructionAccount.id,
        newInstructionAccount
      );
      return {
        ...state,
        instructionAccountsMap,
      };
    }
  );

  private readonly _removeInstructionAccount = this.updater(
    (state, instructionAccountId: string) => {
      const instructionAccountsMap = new Map(state.instructionAccountsMap);
      instructionAccountsMap.delete(instructionAccountId);
      return {
        ...state,
        instructionAccountsMap,
      };
    }
  );

  private readonly _setEvent = this.updater(
    (state, event: InstructionAccountActions) => ({
      ...state,
      event,
    })
  );

  private readonly _setError = this.updater((state, error: unknown) => ({
    ...state,
    error,
  }));

  readonly onInstructionAccountChanges = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this.instructionAccounts$,
    ]).pipe(
      switchMap(([connection, instructionAccounts]) => {
        if (!connection) {
          return of(null);
        }

        return merge(
          ...instructionAccounts.map((instructionAccount) =>
            fromInstructionAccountChange(
              connection,
              new PublicKey(instructionAccount.id)
            ).pipe(
              tapResponse(
                (changes) => {
                  if (!changes) {
                    this._removeInstructionAccount(instructionAccount.id);
                  } else {
                    this._setInstructionAccount(changes);
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

  readonly onInstructionAccountCreated = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
      this.instructionAccounts$,
    ]).pipe(
      switchMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return EMPTY;
        }

        return fromInstructionAccountCreated(connection, {
          workspace: workspaceId,
        }).pipe(
          tapResponse(
            (instructionAccount) =>
              this._addInstructionAccount(instructionAccount),
            (error) => this._setError(error)
          )
        );
      })
    )
  );

  readonly loadInstructionAccounts = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
    ]).pipe(
      concatMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return of([]);
        }

        return getInstructionAccounts(connection, {
          workspace: workspaceId,
        });
      }),
      tapResponse(
        (instructionAccounts) =>
          this.patchState({
            instructionAccountsMap: instructionAccounts.reduce(
              (instructionAccountsMap, instructionAccount) =>
                instructionAccountsMap.set(
                  instructionAccount.id,
                  instructionAccount
                ),
              new Map<string, Document<InstructionAccount>>()
            ),
          }),
        (error) => this._setError(error)
      )
    )
  );

  readonly createInstructionAccount = this.effect(
    (
      request$: Observable<{
        instructionAccountDto: InstructionAccountDto;
        instructionId: string;
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
            { instructionAccountDto, applicationId, instructionId },
          ]) => {
            if (!connection || !authority || !workspaceId) {
              return of(null);
            }

            const instructionAccountKeypair = new Keypair();

            return createCreateInstructionAccountTransaction(
              connection,
              authority,
              new PublicKey(workspaceId),
              new PublicKey(applicationId),
              new PublicKey(instructionId),
              instructionAccountKeypair,
              instructionAccountDto
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              ),
              tapResponse(
                () => this._setEvent(new InstructionAccountCreated()),
                (error) => this._setError(error)
              )
            );
          }
        )
      )
  );

  readonly updateInstructionAccount = this.effect(
    (
      request$: Observable<{
        instructionAccountId: string;
        instructionAccountDto: InstructionAccountDto;
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
            { instructionAccountId, instructionAccountDto },
          ]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createUpdateInstructionAccountTransaction(
              connection,
              authority,
              new PublicKey(instructionAccountId),
              instructionAccountDto
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              ),
              tapResponse(
                () =>
                  this._setEvent(
                    new InstructionAccountUpdated(instructionAccountId)
                  ),
                (error) => this._setError(error)
              )
            );
          }
        )
      )
  );

  readonly deleteInstructionAccount = this.effect(
    (
      request$: Observable<{
        instructionId: string;
        instructionAccountId: string;
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
            { instructionId, instructionAccountId },
          ]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createDeleteInstructionAccountTransaction(
              connection,
              authority,
              new PublicKey(instructionId),
              new PublicKey(instructionAccountId)
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              ),
              tapResponse(
                () =>
                  this._setEvent(
                    new InstructionAccountDeleted(instructionAccountId)
                  ),
                (error) => this._setError(error)
              )
            );
          }
        )
      )
  );
}
