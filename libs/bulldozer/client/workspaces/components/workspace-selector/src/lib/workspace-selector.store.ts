import { Injectable } from '@angular/core';
import { ApplicationApiService } from '@bulldozer-client/applications-data-access';
import {
  CollectionApiService,
  CollectionAttributeApiService,
} from '@bulldozer-client/collections-data-access';
import {
  InstructionAccountApiService,
  InstructionApiService,
  InstructionArgumentApiService,
  InstructionRelationApiService,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notification-store';
import {
  WorkspaceApiService,
  WorkspaceSocketService,
} from '@bulldozer-client/workspaces-data-access';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import {
  generateWorkspaceMetadata,
  generateWorkspaceZip,
} from '@heavy-duty/generator';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  first,
  forkJoin,
  mergeMap,
  Observable,
  of,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  loading: boolean;
  workspaceId: string | null;
  workspacesMap: Map<string, Document<Workspace>>;
}

const initialState: ViewModel = {
  loading: false,
  workspaceId: null,
  workspacesMap: new Map<string, Document<Workspace>>(),
};

@Injectable()
export class WorkspaceSelectorStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly workspacesMap$ = this.select(({ workspacesMap }) => workspacesMap);
  readonly workspaces$ = this.select(this.workspacesMap$, (workspacesMap) =>
    Array.from(workspacesMap, ([, workspace]) => workspace)
  );
  readonly workspace$ = this.select(
    this.workspaceId$,
    this.workspaces$,
    (workspaceId, workspaces) =>
      workspaces.find(({ id }) => id === workspaceId) ?? null
  );

  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _instructionRelationApiService: InstructionRelationApiService,
    private readonly _workspaceSocketService: WorkspaceSocketService,
    private readonly _walletStore: WalletStore,
    private readonly _notificationStore: NotificationStore
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

  readonly setWorkspaceId = this.updater(
    (state, workspaceId: string | null) => ({ ...state, workspaceId })
  );

  private readonly _handleWorkspaceChanges = this.effect(
    (workspaceId$: Observable<string>) =>
      workspaceId$.pipe(
        mergeMap((workspaceId) =>
          this._workspaceSocketService.workspaceChanges(workspaceId).pipe(
            tapResponse(
              (changes) => {
                if (changes === null) {
                  this._removeWorkspace(workspaceId);
                } else {
                  this._setWorkspace(changes);
                }
              },
              (error) => this._notificationStore.setError(error)
            ),
            takeUntil(
              this.loading$.pipe(
                filter((loading) => loading),
                first()
              )
            ),
            takeWhile((workspace) => workspace !== null)
          )
        )
      )
  );

  protected readonly _handleWorkspaceCreated = this.effect(() =>
    this._walletStore.publicKey$.pipe(
      switchMap((authority) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._workspaceSocketService.workspaceCreated({
          authority: authority.toBase58(),
        });
      }),
      tapResponse(
        (workspace) => {
          this._addWorkspace(workspace);
          this._handleWorkspaceChanges(workspace.id);
        },
        (error) => this._notificationStore.setError(error)
      )
    )
  );

  protected readonly _loadWorkspaces = this.effect(() =>
    this._walletStore.publicKey$.pipe(
      tap(() => this.patchState({ loading: true })),
      switchMap((authority) => {
        if (authority === null) {
          return of([]);
        }

        return this._workspaceApiService.find({
          authority: authority.toBase58(),
        });
      }),
      tapResponse(
        (workspaces) => {
          this.patchState({
            workspacesMap: workspaces.reduce(
              (workspacesMap, workspace) =>
                workspacesMap.set(workspace.id, workspace),
              new Map<string, Document<Workspace>>()
            ),
            loading: false,
          });
          workspaces.forEach(({ id }) => {
            this._handleWorkspaceChanges(id);
          });
        },
        (error) => this._notificationStore.setError(error)
      )
    )
  );

  readonly createWorkspace = this.effect(
    ($: Observable<{ workspaceName: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(this.workspaceId$, this._walletStore.publicKey$)
          )
        ),
        concatMap(([{ workspaceName }, workspaceId, authority]) => {
          if (workspaceId === null || authority === null) {
            return EMPTY;
          }

          return this._workspaceApiService.create({
            workspaceName,
            authority: authority.toBase58(),
          });
        }),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Create workspace request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );

  readonly updateWorkspace = this.effect(
    (
      $: Observable<{
        workspaceId: string;
        workspaceName: string;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(([{ workspaceId, workspaceName }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._workspaceApiService.update({
            workspaceName,
            authority: authority.toBase58(),
            workspaceId,
          });
        }),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Update workspace request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );

  readonly deleteWorkspace = this.effect(
    ($: Observable<{ workspaceId: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(([{ workspaceId }, authority]) => {
          if (workspaceId === null || authority === null) {
            return EMPTY;
          }

          return this._workspaceApiService.delete({
            authority: authority.toBase58(),
            workspaceId,
          });
        }),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Delete workspace request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );

  readonly downloadWorkspace = this.effect(
    ($: Observable<{ workspaceId: string }>) =>
      $.pipe(
        concatMap(({ workspaceId }) => {
          if (!workspaceId) {
            return EMPTY;
          }

          return forkJoin({
            workspace: this._workspaceApiService.findById(workspaceId),
            applications: this._applicationApiService.find({
              workspace: workspaceId,
            }),
            collections: this._collectionApiService.find({
              workspace: workspaceId,
            }),
            collectionAttributes: this._collectionAttributeApiService.find({
              workspace: workspaceId,
            }),
            instructions: this._instructionApiService.find({
              workspace: workspaceId,
            }),
            instructionArguments: this._instructionArgumentApiService.find({
              workspace: workspaceId,
            }),
            instructionAccounts: this._instructionAccountApiService.find({
              workspace: workspaceId,
            }),
            instructionRelations: this._instructionRelationApiService.find({
              workspace: workspaceId,
            }),
          }).pipe(
            tapResponse(
              ({
                workspace,
                applications,
                collections,
                collectionAttributes,
                instructions,
                instructionArguments,
                instructionAccounts,
                instructionRelations,
              }) =>
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
              (error) => this._notificationStore.setError(error)
            )
          );
        })
      )
  );
}
