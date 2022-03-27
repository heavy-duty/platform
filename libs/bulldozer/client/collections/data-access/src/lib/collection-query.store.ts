import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { CollectionFilters } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { CollectionApiService } from './collection-api.service';

interface ViewModel {
  loading: boolean;
  collectionIds: string[] | null;
  filters: CollectionFilters | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  collectionIds: null,
};

@Injectable()
export class CollectionQueryStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly collectionIds$ = this.select(({ collectionIds }) => collectionIds);

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollectionIds(this.filters$);
  }

  private readonly _loadCollectionIds = this.effect<CollectionFilters | null>(
    switchMap((filters) => {
      if (filters === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._collectionApiService.findIds(filters).pipe(
        tapResponse(
          (collectionIds) => {
            this.patchState({
              collectionIds,
              loading: false,
            });
          },
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  readonly setFilters = this.updater<CollectionFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );
}
