import { Injectable } from '@angular/core';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
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
  ApplicationActions,
  ApplicationCreated,
  ApplicationDeleted,
  ApplicationInit,
  ApplicationUpdated,
} from './actions/application.actions';

interface ViewModel {
  applicationId: string | null;
  applicationsMap: Map<string, Document<Application>>;
}

const initialState: ViewModel = {
  applicationId: null,
  applicationsMap: new Map<string, Document<Application>>(),
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<ApplicationActions>(
    new ApplicationInit()
  );
  readonly events$ = this._events.asObservable();
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly applicationsMap$ = this.select(
    ({ applicationsMap }) => applicationsMap
  );
  readonly applications$ = this.select(
    this.applicationsMap$,
    (applicationsMap) =>
      Array.from(applicationsMap, ([, application]) => application)
  );
  readonly application$ = this.select(
    this.applicationsMap$,
    this.applicationId$,
    (applications, applicationId) =>
      (applicationId && applications.get(applicationId)) || null
  );

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
    super(initialState);
  }

  private readonly _setApplication = this.updater(
    (state, newApplication: Document<Application>) => {
      const applicationsMap = new Map(state.applicationsMap);
      applicationsMap.set(newApplication.id, newApplication);
      return {
        ...state,
        applicationsMap,
      };
    }
  );

  private readonly _addApplication = this.updater(
    (state, newApplication: Document<Application>) => {
      if (state.applicationsMap.has(newApplication.id)) {
        return state;
      }
      const applicationsMap = new Map(state.applicationsMap);
      applicationsMap.set(newApplication.id, newApplication);
      return {
        ...state,
        applicationsMap,
      };
    }
  );

  private readonly _removeApplication = this.updater(
    (state, applicationId: string) => {
      const applicationsMap = new Map(state.applicationsMap);
      applicationsMap.delete(applicationId);
      return {
        ...state,
        applicationsMap,
      };
    }
  );

  private readonly _watchApplications = this.effect(
    (applications$: Observable<Document<Application>[]>) =>
      applications$.pipe(
        switchMap((applications) =>
          merge(
            ...applications.map((application) =>
              this._bulldozerProgramStore
                .onApplicationUpdated(application.id)
                .pipe(
                  tap((changes) => {
                    if (!changes) {
                      this._removeApplication(application.id);
                    } else {
                      this._setApplication(changes);
                    }
                  })
                )
            )
          )
        )
      )
  );

  private readonly _onApplicationByWorkspaceChanges = this.effect(
    (workspaceId$: Observable<string>) =>
      workspaceId$.pipe(
        switchMap((workspaceId) =>
          this._bulldozerProgramStore
            .onApplicationByWorkspaceChanges(workspaceId)
            .pipe(tap((application) => this._addApplication(application)))
        )
      )
  );

  readonly setApplicationId = this.effect(
    (applicationId$: Observable<string | null>) =>
      applicationId$.pipe(
        tap((applicationId) => this.patchState({ applicationId }))
      )
  );

  readonly loadApplications = this.effect((workspaceId$: Observable<string>) =>
    workspaceId$.pipe(
      concatMap((workspaceId) =>
        this._bulldozerProgramStore
          .getApplicationsByWorkspace(workspaceId)
          .pipe(
            tapResponse(
              (applications) => {
                this.patchState({
                  applicationsMap: applications.reduce(
                    (applicationsMap, application) =>
                      applicationsMap.set(application.id, application),
                    new Map<string, Document<Application>>()
                  ),
                });
                this._onApplicationByWorkspaceChanges(workspaceId);
                this._watchApplications(applications);
              },
              (error) => this._error.next(error)
            )
          )
      )
    )
  );

  readonly createApplication = this.effect(
    (request$: Observable<{ workspaceId: string; data: { name: string } }>) =>
      request$.pipe(
        concatMap(({ workspaceId, data }) =>
          this._bulldozerProgramStore
            .createApplication(workspaceId, data.name)
            .pipe(
              tapResponse(
                () => this._events.next(new ApplicationCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateApplication = this.effect(
    (
      request$: Observable<{
        application: Document<Application>;
        changes: { name: string };
      }>
    ) =>
      request$.pipe(
        concatMap(({ application, changes }) =>
          this._bulldozerProgramStore
            .updateApplication(application.id, changes.name)
            .pipe(
              tapResponse(
                () => this._events.next(new ApplicationUpdated(application.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteApplication = this.effect(
    (application$: Observable<Document<Application>>) =>
      application$.pipe(
        concatMap((application) =>
          this._bulldozerProgramStore
            .deleteApplication(application.data.workspace, application.id)
            .pipe(
              tapResponse(
                () => this._events.next(new ApplicationDeleted(application.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  reload() {
    // this._reload.next(null);
  }
}
