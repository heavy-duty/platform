import { Injectable } from '@angular/core';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  concatMap,
  merge,
  Observable,
  Subject,
  switchMap,
  tap,
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
  workspacesMap: Map<string, Document<Workspace>>;
}

const initialState: ViewModel = {
  workspaceId: null,
  workspacesMap: new Map<string, Document<Workspace>>(),
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
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly workspacesMap$ = this.select(({ workspacesMap }) => workspacesMap);
  readonly workspaces$ = this.select(this.workspacesMap$, (workspacesMap) =>
    Array.from(workspacesMap, ([, workspace]) => workspace)
  );
  readonly workspace$ = this.select(
    this.workspacesMap$,
    this.workspaceId$,
    (workspaces, workspaceId) =>
      (workspaceId && workspaces.get(workspaceId)) || null
  );

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
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

  private readonly _watchWorkspaces = this.effect(
    (workspaces$: Observable<Document<Workspace>[]>) =>
      workspaces$.pipe(
        switchMap((workspaces) =>
          merge(
            ...workspaces.map((workspace) =>
              this._bulldozerProgramStore.onWorkspaceUpdated(workspace.id).pipe(
                tap((changes) => {
                  if (!changes) {
                    this._removeWorkspace(workspace.id);
                  } else {
                    this._setWorkspace(changes);
                  }
                })
              )
            )
          )
        )
      )
  );

  private readonly _onWorkspaceByAuthorityChanges = this.effect((action$) =>
    action$.pipe(
      switchMap(() =>
        this._bulldozerProgramStore
          .onWorkspaceByAuthorityChanges()
          .pipe(tap((workspace) => this._addWorkspace(workspace)))
      )
    )
  );

  readonly setWorkspaceId = this.effect(
    (workspaceId$: Observable<string | null>) =>
      workspaceId$.pipe(tap((workspaceId) => this.patchState({ workspaceId })))
  );

  readonly loadWorkspaces = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        this._bulldozerProgramStore.getWorkspacesByAuthority().pipe(
          tapResponse(
            (workspaces) => {
              this.patchState({
                workspacesMap: workspaces.reduce(
                  (workspacesMap, workspace) =>
                    workspacesMap.set(workspace.id, workspace),
                  new Map<string, Document<Workspace>>()
                ),
              });
              this._onWorkspaceByAuthorityChanges();
              this._watchWorkspaces(workspaces);
            },
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly createWorkspace = this.effect(
    (request$: Observable<{ data: { name: string } }>) =>
      request$.pipe(
        concatMap(({ data }) =>
          this._bulldozerProgramStore.createWorkspace(data.name).pipe(
            tapResponse(
              () => this._events.next(new WorkspaceCreated()),
              (error) => this._error.next(error)
            )
          )
        )
      )
  );

  readonly updateWorkspace = this.effect(
    (
      request$: Observable<{
        workspace: Document<Workspace>;
        changes: { name: string };
      }>
    ) =>
      request$.pipe(
        concatMap(({ workspace, changes }) =>
          this._bulldozerProgramStore
            .updateWorkspace(workspace.id, changes.name)
            .pipe(
              tapResponse(
                () => this._events.next(new WorkspaceUpdated(workspace.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteWorkspace = this.effect(
    (workspace$: Observable<Document<Workspace>>) =>
      workspace$.pipe(
        concatMap((workspace) =>
          this._bulldozerProgramStore.deleteWorkspace(workspace.id).pipe(
            tapResponse(
              () => this._events.next(new WorkspaceDeleted(workspace.id)),
              (error) => this._error.next(error)
            )
          )
        )
      )
  );

  readonly downloadWorkspace = this.effect(
    (workspace$: Observable<Document<Workspace>>) =>
      workspace$
        .pipe
        /* map((workspace) => {
          const workspaceData = this.getWorkspaceData(workspace.id);

          return generateWorkspaceZip(
            workspace,
            generateWorkspaceMetadata(
              workspaceData.applications,
              workspaceData.collections,
              workspaceData.collectionAttributes,
              workspaceData.instructions,
              workspaceData.instructionArguments,
              workspaceData.instructionAccounts,
              workspaceData.instructionRelations
            )
          );
        }) */
        ()
  );

  reload() {
    // this._reload.next(null);
  }
}
