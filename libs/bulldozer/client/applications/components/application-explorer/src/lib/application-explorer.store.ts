import { Injectable } from '@angular/core';
import {
  ApplicationApiService,
  ApplicationSocketService,
} from '@bulldozer-client/applications-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { RouteStore } from '@heavy-duty/bulldozer/application/data-access';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  filter,
  first,
  mergeMap,
  Observable,
  of,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';

interface ViewModel {
  loading: boolean;
  applicationsMap: Map<string, Document<Application>>;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  applicationsMap: new Map<string, Document<Application>>(),
  error: null,
};

@Injectable()
export class ApplicationExplorerStore extends ComponentStore<ViewModel> {
  readonly error$ = this.select(({ error }) => error);
  readonly loading$ = this.select(({ loading }) => loading);
  readonly applicationsMap$ = this.select(
    ({ applicationsMap }) => applicationsMap
  );
  readonly applications$ = this.select(
    this.applicationsMap$,
    (applicationsMap) =>
      Array.from(applicationsMap, ([, application]) => application)
  );

  constructor(
    private readonly _routeStore: RouteStore,
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _applicationSocketService: ApplicationSocketService
  ) {
    super(initialState);

    this._loadApplications(this._routeStore.workspaceId$);
    this._handleApplicationCreated(this._routeStore.workspaceId$);
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

  private readonly _setError = this.updater((state, error: unknown) => ({
    ...state,
    error,
  }));

  private readonly _handleApplicationCreated = this.effect(
    (workspaceId$: Observable<string | null>) =>
      workspaceId$.pipe(
        switchMap((workspaceId) => {
          if (workspaceId === null) {
            return of(null);
          }

          return this._applicationSocketService
            .applicationCreated({
              workspace: workspaceId,
            })
            .pipe(
              tapResponse(
                (application) => {
                  this._addApplication(application);
                  this._handleApplicationChanges(application.id);
                },
                (error) => this._setError(error)
              )
            );
        })
      )
  );

  private readonly _handleApplicationChanges = this.effect(
    (applicationId$: Observable<string>) =>
      applicationId$.pipe(
        mergeMap((applicationId) =>
          this._applicationSocketService.applicationChanges(applicationId).pipe(
            tapResponse(
              (changes) => {
                if (changes === null) {
                  this._removeApplication(applicationId);
                } else {
                  this._setApplication(changes);
                }
              },
              (error) => this._setError(error)
            ),
            takeUntil(
              this.loading$.pipe(
                filter((loading) => loading),
                first()
              )
            ),
            takeWhile((application) => application !== null)
          )
        )
      )
  );

  private readonly _loadApplications = this.effect(
    (workspaceId$: Observable<string | null>) =>
      workspaceId$.pipe(
        tap(() => this.patchState({ loading: true })),
        switchMap((workspaceId) => {
          if (workspaceId === null) {
            return of([]);
          }

          return this._applicationApiService.find({ workspace: workspaceId });
        }),
        tapResponse(
          (applications) => {
            this.patchState({
              applicationsMap: applications.reduce(
                (applicationsMap, application) =>
                  applicationsMap.set(application.id, application),
                new Map<string, Document<Application>>()
              ),
              loading: false,
            });
            applications.forEach(({ id }) => {
              this._handleApplicationChanges(id);
            });
          },
          (error) => this._setError(error)
        )
      )
  );
}
