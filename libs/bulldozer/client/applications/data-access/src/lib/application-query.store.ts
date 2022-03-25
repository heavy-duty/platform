import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { ApplicationFilters } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { ApplicationApiService } from './application-api.service';

interface ViewModel {
  loading: boolean;
  applicationIds: string[] | null;
  filters: ApplicationFilters | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  applicationIds: null,
  error: null,
};

@Injectable()
export class ApplicationQueryStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly applicationIds$ = this.select(
    ({ applicationIds }) => applicationIds
  );

  constructor(
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadApplicationIds(this.filters$);
  }

  readonly addApplication = this.updater<string>((state, newApplicationId) => ({
    ...state,
    applicationIds: [...(state.applicationIds ?? []), newApplicationId],
  }));

  readonly removeApplicationId = this.updater<string>(
    (state, applicationIdToRemove) => ({
      ...state,
      applicationIds:
        state.applicationIds?.filter(
          (applicationId) => applicationId !== applicationIdToRemove
        ) ?? null,
    })
  );

  readonly setFilters = this.updater<ApplicationFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  private readonly _loadApplicationIds = this.effect<ApplicationFilters | null>(
    switchMap((filters) => {
      if (filters === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._applicationApiService.findIds(filters).pipe(
        tapResponse(
          (applicationIds) => {
            this.patchState({
              applicationIds,
              loading: false,
            });
          },
          (error) => {
            this.patchState({
              error,
              loading: false,
            });
            this._notificationStore.setError(error);
          }
        )
      );
    })
  );
}
