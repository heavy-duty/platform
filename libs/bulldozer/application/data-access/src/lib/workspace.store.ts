import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditWorkspaceComponent } from '@heavy-duty/bulldozer/application/features/edit-workspace';
import {
  generateWorkspaceMetadata,
  generateWorkspaceZip,
} from '@heavy-duty/bulldozer/application/utils/services/code-generator';
import {
  Application,
  Collection,
  CollectionAttribute,
  Instruction,
  InstructionAccount,
  InstructionArgument,
  InstructionRelation,
  Workspace,
} from '@heavy-duty/bulldozer/application/utils/types';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  exhaustMap,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import {
  WorkspaceActions,
  WorkspaceCreated,
  WorkspaceDeleted,
  WorkspaceInit,
  WorkspaceUpdated,
} from './actions/workspace.actions';

interface WorkspaceData {
  applications: Application[];
  collections: Collection[];
  collectionAttributes: CollectionAttribute[];
  instructions: Instruction[];
  instructionArguments: InstructionArgument[];
  instructionAccounts: InstructionAccount[];
  instructionRelations: InstructionRelation[];
}

interface ViewModel extends WorkspaceData {
  workspaceId: string | null;
  workspaces: Workspace[];
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

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
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
        this._bulldozerProgramStore.getWorkspaces().pipe(
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
              this._bulldozerProgramStore.getApplications(workspace.id),
              forkJoin([
                this._bulldozerProgramStore.getCollections(workspace.id),
                this._bulldozerProgramStore.getCollectionAttributes(
                  workspace.id
                ),
              ]),
              forkJoin([
                this._bulldozerProgramStore.getInstructions(workspace.id),
                this._bulldozerProgramStore.getInstructionArguments(
                  workspace.id
                ),
                this._bulldozerProgramStore.getInstructionAccounts(
                  workspace.id
                ),
                this._bulldozerProgramStore.getInstructionRelations(
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

  readonly deleteWorkspace = this.effect((workspace$: Observable<Workspace>) =>
    workspace$.pipe(
      concatMap((workspace) =>
        of(workspace).pipe(
          withLatestFrom(
            this.applications$.pipe(
              map((applications) =>
                applications
                  .filter(({ data }) => data.workspace === workspace.id)
                  .map(({ id }) => id)
              )
            ),
            combineLatest([
              this.collections$.pipe(
                map((collections) =>
                  collections
                    .filter(({ data }) => data.workspace === workspace.id)
                    .map(({ id }) => id)
                )
              ),
              this.collectionAttributes$.pipe(
                map((collectionAttributes) =>
                  collectionAttributes
                    .filter(({ data }) => data.workspace === workspace.id)
                    .map(({ id }) => id)
                )
              ),
            ]),
            combineLatest([
              this.instructions$.pipe(
                map((instructions) =>
                  instructions
                    .filter(({ data }) => data.workspace === workspace.id)
                    .map(({ id }) => id)
                )
              ),
              this.instructionArguments$.pipe(
                map((instructionArguments) =>
                  instructionArguments
                    .filter(({ data }) => data.workspace === workspace.id)
                    .map(({ id }) => id)
                )
              ),
              this.instructionAccounts$.pipe(
                map((instructionAccounts) =>
                  instructionAccounts
                    .filter(({ data }) => data.workspace === workspace.id)
                    .map(({ id }) => id)
                )
              ),
              this.instructionRelations$.pipe(
                map((instructionRelations) =>
                  instructionRelations
                    .filter(({ data }) => data.workspace === workspace.id)
                    .map(({ id }) => id)
                )
              ),
            ])
          )
        )
      ),
      concatMap(
        ([
          workspace,
          applications,
          [collections, collectionAttributes],
          [
            instructions,
            instructionArguments,
            instructionAccounts,
            instructionRelations,
          ],
        ]) =>
          this._bulldozerProgramStore
            .deleteWorkspace(
              workspace.id,
              applications,
              collections,
              collectionAttributes,
              instructions,
              instructionArguments,
              instructionAccounts,
              instructionRelations
            )
            .pipe(
              tapResponse(
                () => this._events.next(new WorkspaceDeleted(workspace.id)),
                (error) => this._error.next(error)
              )
            )
      )
    )
  );

  readonly downloadWorkspace = this.effect(
    (workspace$: Observable<Workspace>) =>
      workspace$.pipe(
        concatMap((workspace) =>
          of(workspace).pipe(
            withLatestFrom(
              this.applications$.pipe(
                map((applications) =>
                  applications.filter(
                    ({ data }) => data.workspace === workspace.id
                  )
                )
              ),
              combineLatest([
                this.collections$.pipe(
                  map((collections) =>
                    collections.filter(
                      ({ data }) => data.workspace === workspace.id
                    )
                  )
                ),
                this.collectionAttributes$.pipe(
                  map((collectionAttributes) =>
                    collectionAttributes.filter(
                      ({ data }) => data.workspace === workspace.id
                    )
                  )
                ),
              ]),
              combineLatest([
                this.instructions$.pipe(
                  map((instructions) =>
                    instructions.filter(
                      ({ data }) => data.workspace === workspace.id
                    )
                  )
                ),
                this.instructionArguments$.pipe(
                  map((instructionArguments) =>
                    instructionArguments.filter(
                      ({ data }) => data.workspace === workspace.id
                    )
                  )
                ),
                this.instructionAccounts$.pipe(
                  map((instructionAccounts) =>
                    instructionAccounts.filter(
                      ({ data }) => data.workspace === workspace.id
                    )
                  )
                ),
                this.instructionRelations$.pipe(
                  map((instructionRelations) =>
                    instructionRelations.filter(
                      ({ data }) => data.workspace === workspace.id
                    )
                  )
                ),
              ])
            )
          )
        ),
        map(
          ([
            workspace,
            applications,
            [collections, collectionAttributes],
            [
              instructions,
              instructionArguments,
              instructionAccounts,
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
            )
        )
      )
  );

  reload() {
    this._reload.next(null);
  }
}
