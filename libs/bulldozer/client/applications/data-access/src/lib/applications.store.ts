import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Application,
  ApplicationFilters,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { ApplicationApiService } from './application-api.service';

interface ViewModel {
  loading: boolean;
  filters: ApplicationFilters | null;
  applicationIds: List<string> | null;
  applicationsMap: Map<string, Document<Application>> | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  applicationIds: null,
  applicationsMap: null,
};

@Injectable()
export class ApplicationsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly applicationIds$ = this.select(
    ({ applicationIds }) => applicationIds
  );
  readonly applicationsMap$ = this.select(
    ({ applicationsMap }) => applicationsMap
  );
  readonly applications$ = this.select(
    this.applicationsMap$,
    (applicationsMap) =>
      applicationsMap === null
        ? null
        : applicationsMap
            .toList()
            .sort((a, b) => (b.createdAt.lt(a.createdAt) ? 1 : -1))
  );

  constructor(
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadApplications(this.applicationIds$);
    this._loadApplicationIds(this.filters$);
  }

  readonly setFilters = this.updater<ApplicationFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
      applicationIds: null,
      applicationsMap: null,
    })
  );

  private readonly _loadApplicationIds = this.effect<ApplicationFilters | null>(
    switchMap((filters) => {
      if (filters === null) {
        return EMPTY;
      }

      this.patchState({
        loading: true,
        applicationIds: List(),
        applicationsMap: null,
      });

      return this._applicationApiService.findIds(filters).pipe(
        tapResponse(
          (applicationIds) => {
            this.patchState({
              applicationIds: List(applicationIds),
            });
          },
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  private readonly _loadApplications = this.effect<List<string> | null>(
    switchMap((applicationIds) => {
      if (applicationIds === null) {
        return EMPTY;
      }

      return this._applicationApiService
        .findByIds(applicationIds.toArray())
        .pipe(
          tapResponse(
            (applications) => {
              this.patchState({
                loading: false,
                applicationsMap: applications
                  .filter(
                    (application): application is Document<Application> =>
                      application !== null
                  )
                  .reduce(
                    (applicationsMap, application) =>
                      applicationsMap.set(application.id, application),
                    Map<string, Document<Application>>()
                  ),
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );
}
