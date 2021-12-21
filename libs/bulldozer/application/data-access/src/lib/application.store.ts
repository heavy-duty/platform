import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditApplicationComponent } from '@heavy-duty/bulldozer/application/features/edit-application';
import { Application } from '@heavy-duty/bulldozer/application/utils/types';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

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
  applications: Application[];
  error: unknown | null;
}

const initialState = {
  applicationId: null,
  applications: [],
  error: null,
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  private readonly _events = new BehaviorSubject<ApplicationActions>(
    new ApplicationInit()
  );
  readonly events$ = this._events.asObservable();
  readonly applications$ = this.select(({ applications }) => applications);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly application$ = this.select(
    this.applications$,
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

  readonly loadApplications = this.effect(() =>
    combineLatest([
      this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([workspaceId]) =>
        this._bulldozerProgramStore.getApplications(workspaceId).pipe(
          tapResponse(
            (applications) => this.patchState({ applications }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly selectApplication = this.effect(
    (applicationId$: Observable<string>) =>
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
              this._bulldozerProgramStore
                .createApplication(workspaceId, name)
                .pipe(
                  tapResponse(
                    () => this._events.next(new ApplicationCreated()),
                    (error) => this._error.next(error)
                  )
                )
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
                this._bulldozerProgramStore
                  .updateApplication(application.id, name)
                  .pipe(
                    tapResponse(
                      () =>
                        this._events.next(
                          new ApplicationUpdated(application.id)
                        ),
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly deleteApplication = this.effect(
    (applicationId$: Observable<string>) =>
      applicationId$.pipe(
        concatMap((applicationId) =>
          this._bulldozerProgramStore.deleteApplication(applicationId).pipe(
            tapResponse(
              () => this._events.next(new ApplicationDeleted(applicationId)),
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
