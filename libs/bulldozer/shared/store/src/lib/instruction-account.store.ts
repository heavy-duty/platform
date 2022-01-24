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
  instructionAccountsMap: Map<string, Document<InstructionAccount>>;
}

const initialState: ViewModel = {
  instructionAccountsMap: new Map<string, Document<InstructionAccount>>(),
};

@Injectable()
export class InstructionAccountStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
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
              tap((changes) => {
                if (!changes) {
                  this._removeInstructionAccount(instructionAccount.id);
                } else {
                  this._setInstructionAccount(changes);
                }
              })
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
          tap((instructionAccount) =>
            this._addInstructionAccount(instructionAccount)
          )
        );
      })
    )
  );

  readonly loadInstructionAccounts = this.effect(($) =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
      $,
    ]).pipe(
      concatMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return of([]);
        }

        return getInstructionAccounts(connection, {
          workspace: workspaceId,
        }).pipe(
          catchError((error) => {
            console.error(error);
            return EMPTY;
          })
        );
      }),
      tap((instructionAccounts) =>
        this.patchState({
          instructionAccountsMap: instructionAccounts.reduce(
            (instructionAccountsMap, instructionAccount) =>
              instructionAccountsMap.set(
                instructionAccount.id,
                instructionAccount
              ),
            new Map<string, Document<InstructionAccount>>()
          ),
        })
      )
    )
  );

  readonly createInstructionAccount = this.effect(
    (
      request$: Observable<{
        instructionAccountDto: InstructionAccountDto;
        instructionAccountId: string;
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
            { instructionAccountDto, applicationId, instructionAccountId },
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
              new PublicKey(instructionAccountId),
              instructionAccountKeypair,
              instructionAccountDto
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
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
              )
            );
          }
        )
      )
  );
}
