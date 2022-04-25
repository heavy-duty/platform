import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Collection,
  CollectionFilters,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { CollectionApiService } from './collection-api.service';

interface ViewModel {
  loading: boolean;
  filters: CollectionFilters | null;
  collectionIds: List<string> | null;
  collectionsMap: Map<string, Document<Collection>> | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  collectionIds: null,
  collectionsMap: null,
};

@Injectable()
export class CollectionsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly collectionIds$ = this.select(({ collectionIds }) => collectionIds);
  readonly collectionsMap$ = this.select(
    ({ collectionsMap }) => collectionsMap
  );
  readonly collections$ = this.select(this.collectionsMap$, (collectionsMap) =>
    collectionsMap === null
      ? null
      : collectionsMap
          .toList()
          .sort((a, b) => (b.createdAt.lt(a.createdAt) ? 1 : -1))
  );

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollections(this.collectionIds$);
    this._loadCollectionIds(this.filters$);
  }

  readonly setFilters = this.updater<CollectionFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
      collectionIds: null,
      collectionsMap: null,
    })
  );

  private readonly _loadCollectionIds = this.effect<CollectionFilters | null>(
    switchMap((filters) => {
      if (filters === null) {
        return EMPTY;
      }

      this.patchState({
        loading: true,
        collectionIds: List(),
        collectionsMap: null,
      });

      return this._collectionApiService.findIds(filters).pipe(
        tapResponse(
          (collectionIds) => {
            this.patchState({
              collectionIds: List(collectionIds),
            });
          },
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  private readonly _loadCollections = this.effect<List<string> | null>(
    switchMap((collectionIds) => {
      if (collectionIds === null) {
        return EMPTY;
      }

      if (collectionIds.size === 0) {
        this.patchState({
          loading: false,
          collectionsMap: Map<string, Document<Collection>>(),
        });

        return EMPTY;
      }

      return this._collectionApiService.findByIds(collectionIds.toArray()).pipe(
        tapResponse(
          (collections) => {
            this.patchState({
              loading: false,
              collectionsMap: collections
                .filter(
                  (collection): collection is Document<Collection> =>
                    collection !== null
                )
                .reduce(
                  (collectionsMap, collection) =>
                    collectionsMap.set(collection.id, collection),
                  Map<string, Document<Collection>>()
                ),
            });
          },
          (error) => this._notificationStore.setError({ error })
        )
      );
    })
  );
}
