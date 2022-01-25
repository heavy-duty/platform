import { Injectable } from '@angular/core';
import {
  createCreateWorkspaceTransaction,
  createDeleteWorkspaceTransaction,
  createUpdateWorkspaceTransaction,
  Document,
  fromWorkspaceChange,
  fromWorkspaceCreated,
  getApplications,
  getCollectionAttributes,
  getCollections,
  getInstructionAccounts,
  getInstructionArguments,
  getInstructionRelations,
  getInstructions,
  getWorkspace,
  getWorkspaces,
  Workspace,
} from '@heavy-duty/bulldozer-devkit';
import {
  generateWorkspaceMetadata,
  generateWorkspaceZip,
} from '@heavy-duty/generator';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  combineLatest,
  concatMap,
  EMPTY,
  forkJoin,
  merge,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import {
  WorkspaceActions,
  WorkspaceCreated,
  WorkspaceDeleted,
  WorkspaceUpdated,
} from './actions';
import { BulldozerProgramStore } from './bulldozer-program.store';
import { ConnectionStore } from './connection-store';

interface ViewModel {
  workspacesMap: Map<string, Document<Workspace>>;
  error?: unknown;
  event?: WorkspaceActions;
}

const initialState = {
  workspacesMap: new Map<string, Document<Workspace>>(),
};

@Injectable()
export class WorkspaceStore extends ComponentStore<ViewModel> {
  readonly event$ = this.select(({ event }) => event);
  readonly error$ = this.select(({ error }) => error);
  readonly workspacesMap$ = this.select(({ workspacesMap }) => workspacesMap);
  readonly workspaces$ = this.select(this.workspacesMap$, (workspacesMap) =>
    Array.from(workspacesMap, ([, workspace]) => workspace)
  );

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
    super(initialState);
  }

  private readonly _setWorkspace = this.updater(
    (state, newWorkspace: Document<Workspace>) => {
      const workspacesMap = new Map(state.workspacesMap);
      workspacesMap.set(newWorkspace.id, newWorkspace);
      return {
        ...state,
        workspacesMap,
      };
    }
  );

  private readonly _addWorkspace = this.updater(
    (state, newWorkspace: Document<Workspace>) => {
      if (state.workspacesMap.has(newWorkspace.id)) {
        return state;
      }
      const workspacesMap = new Map(state.workspacesMap);
      workspacesMap.set(newWorkspace.id, newWorkspace);
      return {
        ...state,
        workspacesMap,
      };
    }
  );

  private readonly _removeWorkspace = this.updater(
    (state, workspaceId: string) => {
      const workspacesMap = new Map(state.workspacesMap);
      workspacesMap.delete(workspaceId);
      return {
        ...state,
        workspacesMap,
      };
    }
  );

  private readonly _setEvent = this.updater(
    (state, event: WorkspaceActions) => ({
      ...state,
      event,
    })
  );

  private readonly _setError = this.updater((state, error: unknown) => ({
    ...state,
    error,
  }));

  readonly onWorkspaceChanges = this.effect(() =>
    combineLatest([this._connectionStore.connection$, this.workspaces$]).pipe(
      switchMap(([connection, workspaces]) => {
        if (!connection) {
          return of(null);
        }

        return merge(
          ...workspaces.map((workspace) =>
            fromWorkspaceChange(connection, new PublicKey(workspace.id)).pipe(
              tapResponse(
                (changes) => {
                  if (!changes) {
                    this._removeWorkspace(workspace.id);
                  } else {
                    this._setWorkspace(changes);
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

  readonly onWorkspaceByAuthorityCreated = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._walletStore.publicKey$,
      this.workspaces$,
    ]).pipe(
      switchMap(([connection, authority]) => {
        if (!connection || !authority) {
          return EMPTY;
        }

        return fromWorkspaceCreated(connection, {
          authority: authority.toBase58(),
        }).pipe(
          tapResponse(
            (workspace) => this._addWorkspace(workspace),
            (error) => this._setError(error)
          )
        );
      })
    )
  );

  readonly loadWorkspacesByAuthority = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._walletStore.publicKey$,
    ]).pipe(
      concatMap(([connection, authority]) => {
        if (!connection || !authority) {
          return of([]);
        }

        return getWorkspaces(connection, {
          authority: authority.toBase58(),
        });
      }),
      tapResponse(
        (workspaces) =>
          this.patchState({
            workspacesMap: workspaces.reduce(
              (workspacesMap, workspace) =>
                workspacesMap.set(workspace.id, workspace),
              new Map<string, Document<Workspace>>()
            ),
          }),
        (error) => this._setError(error)
      )
    )
  );

  readonly createWorkspace = this.effect((workspaceName$: Observable<string>) =>
    combineLatest([
      this._connectionStore.connection$,
      this._walletStore.publicKey$,
      workspaceName$,
    ]).pipe(
      concatMap(([connection, authority, workspaceName]) => {
        if (!connection || !authority) {
          return of(null);
        }

        const workspaceKeypair = new Keypair();

        return createCreateWorkspaceTransaction(
          connection,
          authority,
          workspaceKeypair,
          workspaceName
        ).pipe(
          this._bulldozerProgramStore.signSendAndConfirmTransactions(
            connection
          ),
          tapResponse(
            () => this._setEvent(new WorkspaceCreated()),
            (error) => this._setError(error)
          )
        );
      })
    )
  );

  readonly updateWorkspace = this.effect(
    (request$: Observable<{ workspaceId: string; workspaceName: string }>) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(([connection, authority, { workspaceId, workspaceName }]) => {
          if (!connection || !authority) {
            return of(null);
          }

          return createUpdateWorkspaceTransaction(
            connection,
            authority,
            new PublicKey(workspaceId),
            workspaceName
          ).pipe(
            this._bulldozerProgramStore.signSendAndConfirmTransactions(
              connection
            ),
            tapResponse(
              () => this._setEvent(new WorkspaceUpdated(workspaceId)),
              (error) => this._setError(error)
            )
          );
        })
      )
  );

  readonly deleteWorkspace = this.effect((workspaceId$: Observable<string>) =>
    combineLatest([
      this._connectionStore.connection$,
      this._walletStore.publicKey$,
      workspaceId$,
    ]).pipe(
      concatMap(([connection, authority, workspaceId]) => {
        if (!connection || !authority) {
          return of(null);
        }

        return createDeleteWorkspaceTransaction(
          connection,
          authority,
          new PublicKey(workspaceId)
        ).pipe(
          this._bulldozerProgramStore.signSendAndConfirmTransactions(
            connection
          ),
          tapResponse(
            () => this._setEvent(new WorkspaceDeleted(workspaceId)),
            (error) => this._setError(error)
          )
        );
      })
    )
  );

  readonly downloadWorkspace = this.effect((workspaceId$: Observable<string>) =>
    combineLatest([this._connectionStore.connection$, workspaceId$]).pipe(
      concatMap(([connection, workspaceId]) => {
        if (!connection) {
          return of(null);
        }

        return forkJoin([
          getWorkspace(connection, new PublicKey(workspaceId)),
          getApplications(connection, {
            workspace: workspaceId,
          }),
          forkJoin([
            getCollections(connection, { workspace: workspaceId }),
            getCollectionAttributes(connection, { workspace: workspaceId }),
          ]),
          forkJoin([
            getInstructions(connection, { workspace: workspaceId }),
            getInstructionAccounts(connection, { workspace: workspaceId }),
            getInstructionArguments(connection, { workspace: workspaceId }),
            getInstructionRelations(connection, { workspace: workspaceId }),
          ]),
        ]).pipe(
          tapResponse(
            ([
              workspace,
              applications,
              [collections, collectionAttributes],
              [
                instructions,
                instructionAccounts,
                instructionArguments,
                instructionRelations,
              ],
            ]) =>
              workspace &&
              generateWorkspaceZip(
                workspace,
                generateWorkspaceMetadata(
                  applications,
                  collections,
                  collectionAttributes,
                  instructions,
                  instructionArguments,
                  instructionAccounts,
                  instructionRelations
                )
              ),
            (error) => this._setError(error)
          )
        );
      })
    )
  );
}
