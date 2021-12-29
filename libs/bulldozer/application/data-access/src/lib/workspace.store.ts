import { Injectable } from '@angular/core';
import {
  Application,
  Collection,
  CollectionAttribute,
  Document,
  Instruction,
  InstructionAccount,
  InstructionArgument,
  InstructionRelation,
  Workspace,
} from '@heavy-duty/bulldozer-devkit';
import {
  generateWorkspaceMetadata,
  generateWorkspaceZip,
} from '@heavy-duty/bulldozer-generator';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  concatMap,
  forkJoin,
  map,
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

interface WorkspaceData {
  applications: Document<Application>[];
  collections: Document<Collection>[];
  collectionAttributes: Document<CollectionAttribute>[];
  instructions: Document<Instruction>[];
  instructionArguments: Document<InstructionArgument>[];
  instructionAccounts: Document<InstructionAccount>[];
  instructionRelations: Document<InstructionRelation>[];
}

interface ViewModel extends WorkspaceData {
  workspaceId: string | null;
  workspaces: Document<Workspace>[];
  error: unknown | null;
}

const initialState = {
  workspaceId: null,
  workspaces: [],
  applications: [],
  collections: [],
  collectionAttributes: [],
  instructions: [],
  instructionArguments: [],
  instructionAccounts: [],
  instructionRelations: [],
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
  readonly applications$ = this.select(({ applications }) => applications);
  readonly collections$ = this.select(({ collections }) => collections);
  readonly collectionAttributes$ = this.select(
    ({ collectionAttributes }) => collectionAttributes
  );
  readonly instructions$ = this.select(({ instructions }) => instructions);
  readonly instructionArguments$ = this.select(
    ({ instructionArguments }) => instructionArguments
  );
  readonly instructionAccounts$ = this.select(
    ({ instructionAccounts }) => instructionAccounts
  );
  readonly instructionRelations$ = this.select(
    ({ instructionRelations }) => instructionRelations
  );

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
    super(initialState);
  }

  readonly addWorkspaceData = this.updater(
    (state, workspaceData: WorkspaceData) => ({
      ...state,
      applications: [...state.applications, ...workspaceData.applications],
      collections: [...state.collections, ...workspaceData.collections],
      collectionAttributes: [
        ...state.collectionAttributes,
        ...workspaceData.collectionAttributes,
      ],
      instructions: [...state.instructions, ...workspaceData.instructions],
      instructionArguments: [
        ...state.instructionArguments,
        ...workspaceData.instructionArguments,
      ],
      instructionAccounts: [
        ...state.instructionAccounts,
        ...workspaceData.instructionAccounts,
      ],
      instructionRelations: [
        ...state.instructionRelations,
        ...workspaceData.instructionRelations,
      ],
    })
  );

  readonly loadWorkspaces = this.effect(() =>
    this.reload$.pipe(
      switchMap(() =>
        this._bulldozerProgramStore.getWorkspacesByAuthority().pipe(
          tapResponse(
            (workspaces) => this.patchState({ workspaces }),
            (error) => this._error.next(error)
          )
        )
      ),
      switchMap((workspaces) =>
        forkJoin(
          workspaces.map((workspace) =>
            forkJoin([
              this._bulldozerProgramStore.getApplicationsByWorkspace(
                workspace.id
              ),
              forkJoin([
                this._bulldozerProgramStore.getCollectionsByWorkspace(
                  workspace.id
                ),
                this._bulldozerProgramStore.getCollectionAttributesByWorkspace(
                  workspace.id
                ),
              ]),
              forkJoin([
                this._bulldozerProgramStore.getInstructionsByWorkspace(
                  workspace.id
                ),
                this._bulldozerProgramStore.getInstructionArgumentsByWorkspace(
                  workspace.id
                ),
                this._bulldozerProgramStore.getInstructionAccountsByWorkspace(
                  workspace.id
                ),
                this._bulldozerProgramStore.getInstructionRelationsByWorkspace(
                  workspace.id
                ),
              ]),
            ]).pipe(
              map(
                ([
                  applications,
                  [collections, collectionAttributes],
                  [
                    instructions,
                    instructionArguments,
                    instructionAccounts,
                    instructionRelations,
                  ],
                ]) => ({
                  applications,
                  collections,
                  collectionAttributes,
                  instructions,
                  instructionArguments,
                  instructionAccounts,
                  instructionRelations,
                })
              )
            )
          )
        )
      ),
      tapResponse(
        (workspacesData) => {
          workspacesData.forEach((workspaceData) =>
            this.addWorkspaceData(workspaceData)
          );
        },
        (error) => this._error.next(error)
      )
    )
  );

  readonly selectWorkspace = this.effect((workspaceId$: Observable<string>) =>
    workspaceId$.pipe(tap((workspaceId) => this.patchState({ workspaceId })))
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
        concatMap((workspace) => {
          const workspaceData = this.getWorkspaceData(workspace.id);

          return this._bulldozerProgramStore
            .deleteWorkspace(
              workspace.id,
              workspaceData.applications.map(({ id }) => id),
              workspaceData.collections.map(({ id }) => id),
              workspaceData.collectionAttributes.map(({ id }) => id),
              workspaceData.instructions.map(({ id }) => id),
              workspaceData.instructionArguments.map(({ id }) => id),
              workspaceData.instructionAccounts.map(({ id }) => id),
              workspaceData.instructionRelations.map(({ id }) => id)
            )
            .pipe(
              tapResponse(
                () => this._events.next(new WorkspaceDeleted(workspace.id)),
                (error) => this._error.next(error)
              )
            );
        })
      )
  );

  readonly downloadWorkspace = this.effect(
    (workspace$: Observable<Document<Workspace>>) =>
      workspace$.pipe(
        map((workspace) => {
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
        })
      )
  );

  reload() {
    this._reload.next(null);
  }

  getWorkspaceData(workspaceId: string) {
    return {
      applications: this.get().applications.filter(
        ({ data }) => data.workspace === workspaceId
      ),
      collections: this.get().collections.filter(
        ({ data }) => data.workspace === workspaceId
      ),
      collectionAttributes: this.get().collectionAttributes.filter(
        ({ data }) => data.workspace === workspaceId
      ),
      instructions: this.get().instructions.filter(
        ({ data }) => data.workspace === workspaceId
      ),
      instructionArguments: this.get().instructionArguments.filter(
        ({ data }) => data.workspace === workspaceId
      ),
      instructionAccounts: this.get().instructionAccounts.filter(
        ({ data }) => data.workspace === workspaceId
      ),
      instructionRelations: this.get().instructionRelations.filter(
        ({ data }) => data.workspace === workspaceId
      ),
    };
  }

  getApplicationData(applicationId: string) {
    return {
      collections: this.get().collections.filter(
        ({ data }) => data.application === applicationId
      ),
      collectionAttributes: this.get().collectionAttributes.filter(
        ({ data }) => data.application === applicationId
      ),
      instructions: this.get().instructions.filter(
        ({ data }) => data.application === applicationId
      ),
      instructionArguments: this.get().instructionArguments.filter(
        ({ data }) => data.application === applicationId
      ),
      instructionAccounts: this.get().instructionAccounts.filter(
        ({ data }) => data.application === applicationId
      ),
      instructionRelations: this.get().instructionRelations.filter(
        ({ data }) => data.application === applicationId
      ),
    };
  }

  getInstructionData(instructionId: string) {
    return {
      instructionArguments: this.get().instructionArguments.filter(
        ({ data }) => data.instruction === instructionId
      ),
      instructionAccounts: this.get().instructionAccounts.filter(
        ({ data }) => data.instruction === instructionId
      ),
      instructionRelations: this.get().instructionRelations.filter(
        ({ data }) => data.instruction === instructionId
      ),
    };
  }

  getCollectionData(collectionId: string) {
    return {
      collectionAttributes: this.get().collectionAttributes.filter(
        ({ data }) => data.collection === collectionId
      ),
    };
  }
}
