import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditApplicationComponent } from '@heavy-duty/bulldozer/application/features/edit-application';
import { Application, ProgramStore } from '@heavy-duty/bulldozer/data-access';
import { generateProgramRustCode } from '@heavy-duty/code-generator';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

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
  readonly applications$ = this.select(({ applications }) => applications);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly application$ = this.select(
    this.applications$,
    this.applicationId$,
    (applications, applicationId) =>
      applications.find(({ id }) => id === applicationId) || null
  );
  readonly rustCode$ = this.select(this.applicationId$, (applicationId) => {
    return this._programStore.getApplicationMetadata(applicationId || '');
  }).pipe(map((data) => generateProgramRustCode(data)));

  constructor(
    private readonly _programStore: ProgramStore,
    private readonly _matDialog: MatDialog
  ) {
    super(initialState);
  }

  readonly loadApplications = this.effect(() =>
    this.reload$.pipe(
      switchMap(() =>
        this._programStore.getApplications().pipe(
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
            concatMap(({ name }) =>
              this._programStore.createApplication(name).pipe(
                tapResponse(
                  () => this._reload.next(null),
                  (error) => {
                    console.log('do I even get here?', error);
                    this._error.next(error);
                  }
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
                this._programStore.updateApplication(application.id, name).pipe(
                  tapResponse(
                    () => this._reload.next(null),
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
          this._programStore.deleteApplication(applicationId).pipe(
            tapResponse(
              () => this._reload.next(null),
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
