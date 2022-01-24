import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditWorkspaceComponent } from '@heavy-duty/bulldozer/application/features/edit-workspace';
import {
  Application,
  CollectionExtended,
  InstructionExtended,
  Workspace,
} from '@heavy-duty/bulldozer/application/utils/types';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { sendAndConfirmRawTransaction } from '@solana/web3.js';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  defer,
  exhaustMap,
  filter,
  from,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  WorkspaceActions,
  WorkspaceCreated,
  WorkspaceDeleted,
  WorkspaceInit,
  WorkspaceUpdated,
} from './actions/workspace.actions';

interface ViewModel {
  workspaceId: string | null;
  workspaces: Workspace[];
  error: unknown | null;
}

const initialState = {
  workspaceId: null,
  workspaces: [],
  error: null,
};

@Injectable()
export class WorkspaceStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  private readonly _events = new BehaviorSubject<WorkspaceActions>(
    new WorkspaceInit()
  );
  readonly events$ = this._events.asObservable();
  readonly workspaces$ = this.select(({ workspaces }) => workspaces);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly workspace$ = this.select(
    this.workspaces$,
    this.workspaceId$,
    (workspaces, workspaceId) =>
      workspaces.find(({ id }) => id === workspaceId) || null
  );

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);
  }

  readonly loadWorkspaces = this.effect(() =>
    combineLatest([
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([publicKey]) =>
        this._bulldozerProgramStore.getWorkspaces(publicKey.toBase58()).pipe(
          tapResponse(
            (workspaces) => this.patchState({ workspaces }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly selectWorkspace = this.effect((workspaceId$: Observable<string>) =>
    workspaceId$.pipe(tap((workspaceId) => this.patchState({ workspaceId })))
  );

  readonly createWorkspace = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditWorkspaceComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            concatMap(({ name }) =>
              this._bulldozerProgramStore.createWorkspace(name)
            ),
            tapResponse(
              () => this._events.next(new WorkspaceCreated()),
              (error) => this._error.next(error)
            )
          )
      )
    )
  );

  readonly updateWorkspace = this.effect((workspace$: Observable<Workspace>) =>
    workspace$.pipe(
      exhaustMap((workspace) =>
        this._matDialog
          .open(EditWorkspaceComponent, { data: { workspace } })
          .afterClosed()
          .pipe(
            filter((data) => data),
            concatMap(({ name }) =>
              this._bulldozerProgramStore.updateWorkspace(workspace.id, name)
            ),
            tapResponse(
              () => this._events.next(new WorkspaceUpdated(workspace.id)),
              (error) => this._error.next(error)
            )
          )
      )
    )
  );

  readonly deleteWorkspace = this.effect(
    (
      request$: Observable<{
        workspace: Workspace;
        applications: Application[];
        collections: CollectionExtended[];
        instructions: InstructionExtended[];
      }>
    ) =>
      request$.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this._connectionStore.connection$.pipe(isNotNullOrUndefined),
              this._walletStore.publicKey$.pipe(isNotNullOrUndefined)
            )
          )
        ),
        concatMap(
          ([
            { workspace, applications, collections, instructions },
            connection,
            walletPublicKey,
          ]) =>
            this._bulldozerProgramStore
              .getDeleteWorkspaceTransactions(
                connection,
                walletPublicKey,
                workspace,
                applications,
                collections,
                instructions
              )
              .pipe(
                concatMap((transactions) => {
                  const signAllTransactions$ =
                    this._walletStore.signAllTransactions(transactions);

                  if (!signAllTransactions$) {
                    return throwError(
                      new Error('Sign all transactions method is not defined')
                    );
                  }

                  return signAllTransactions$;
                }),
                concatMap((transactions) =>
                  from(
                    defer(() =>
                      Promise.all(
                        transactions.map((transaction) =>
                          sendAndConfirmRawTransaction(
                            connection,
                            transaction.serialize()
                          )
                        )
                      )
                    )
                  )
                ),
                tapResponse(
                  () => this._events.next(new WorkspaceDeleted(workspace.id)),
                  (error) => this._error.next(error)
                )
              )
        )
      )
  );

  reload() {
    this._reload.next(null);
  }
}
