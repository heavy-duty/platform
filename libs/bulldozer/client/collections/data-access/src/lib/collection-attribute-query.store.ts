import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { CollectionAttributeFilters } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { CollectionAttributeApiService } from './collection-attribute-api.service';

interface ViewModel {
  loading: boolean;
  collectionAttributeIds: string[] | null;
  filters: CollectionAttributeFilters | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  collectionAttributeIds: null,
};

@Injectable()
export class CollectionAttributeQueryStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly collectionAttributeIds$ = this.select(
    ({ collectionAttributeIds }) => collectionAttributeIds
  );

  constructor(
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollectionAttributeIds(this.filters$);
  }

  private readonly _loadCollectionAttributeIds =
    this.effect<CollectionAttributeFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({ loading: true });

        return this._collectionAttributeApiService.findIds(filters).pipe(
          tapResponse(
            (collectionAttributeIds) => {
              this.patchState({
                collectionAttributeIds,
                loading: false,
              });
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  readonly setFilters = this.updater<CollectionAttributeFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );
}
