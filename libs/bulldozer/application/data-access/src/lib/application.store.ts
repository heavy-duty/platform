import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditApplicationComponent } from '@heavy-duty/bulldozer/application/features/edit-application';
import { Application } from '@heavy-duty/bulldozer/application/utils/types';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  exhaustMap,
  filter,
  map,
  Observable,
  of,
  Subject,
  tap,
  withLatestFrom,
} from 'rxjs';
import {
  ApplicationActions,
  ApplicationCreated,
  ApplicationDeleted,
  ApplicationInit,
  ApplicationUpdated,
} from './actions/application.actions';
import { WorkspaceStore } from './workspace.store';

interface ViewModel {
  applicationId: string | null;
  error: unknown | null;
}

const initialState = {
  applicationId: null,
  error: null,
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<ApplicationActions>(
    new ApplicationInit()
  );
  readonly events$ = this._events.asObservable();
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly applications$ = this.select(
    this._workspaceStore.applications$,
    this._workspaceStore.workspaceId$,
    (applications, workspaceId) =>
      applications.filter(({ data }) => data.workspace === workspaceId)
  );
  readonly application$ = this.select(
    this._workspaceStore.applications$,
    this.applicationId$,
    (applications, applicationId) =>
      applications.find(({ id }) => id === applicationId) || null
  );

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _workspaceStore: WorkspaceStore
  ) {
    super(initialState);
  }

  readonly selectApplication = this.effect(
    (applicationId$: Observable<string | null>) =>
      applicationId$.pipe(
        tap((applicationId) => this.patchState({ applicationId }))
      )
  );

  readonly createApplication = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditApplicationComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name }, workspaceId]) =>
              this._bulldozerProgramStore.createApplication(workspaceId, name)
            ),
            tapResponse(
              () => this._events.next(new ApplicationCreated()),
              (error) => this._error.next(error)
            )
          )
      )
    )
  );

  readonly updateApplication = this.effect(
    (application$: Observable<Application>) =>
      application$.pipe(
        exhaustMap((application) =>
          this._matDialog
            .open(EditApplicationComponent, { data: { application } })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name }) =>
                this._bulldozerProgramStore.updateApplication(
                  application.id,
                  name
                )
              ),
              tapResponse(
                () => this._events.next(new ApplicationUpdated(application.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteApplication = this.effect(
    (application$: Observable<Application>) =>
      application$.pipe(
        concatMap((application) =>
          of(application).pipe(
            withLatestFrom(
              combineLatest([
                this._workspaceStore.collections$.pipe(
                  map((collections) =>
                    collections
                      .filter(({ data }) => data.application === application.id)
                      .map(({ id }) => id)
                  )
                ),
                this._workspaceStore.collectionAttributes$.pipe(
                  map((collectionAttributes) =>
                    collectionAttributes
                      .filter(({ data }) => data.application === application.id)
                      .map(({ id }) => id)
                  )
                ),
              ]),
              combineLatest([
                this._workspaceStore.instructions$.pipe(
                  map((instructions) =>
                    instructions
                      .filter(({ data }) => data.application === application.id)
                      .map(({ id }) => id)
                  )
                ),
                this._workspaceStore.instructionArguments$.pipe(
                  map((instructions) =>
                    instructions
                      .filter(({ data }) => data.application === application.id)
                      .map(({ id }) => id)
                  )
                ),
                this._workspaceStore.instructionAccounts$.pipe(
                  map((instructionAccounts) =>
                    instructionAccounts
                      .filter(({ data }) => data.application === application.id)
                      .map(({ id }) => id)
                  )
                ),
                this._workspaceStore.instructionRelations$.pipe(
                  map((instructionRelations) =>
                    instructionRelations
                      .filter(({ data }) => data.application === application.id)
                      .map(({ id }) => id)
                  )
                ),
              ])
            )
          )
        ),
        concatMap(
          ([
            application,
            [collections, collectionAttributes],
            [
              instructions,
              instructionArguments,
              instructionAccounts,
              instructionRelations,
            ],
          ]) =>
            this._bulldozerProgramStore
              .deleteApplication(
                application.id,
                collections,
                collectionAttributes,
                instructions,
                instructionArguments,
                instructionAccounts,
                instructionRelations
              )
              .pipe(
                tapResponse(
                  () =>
                    this._events.next(new ApplicationDeleted(application.id)),
                  (error) => this._error.next(error)
                )
              )
        )
      )
  );
}
