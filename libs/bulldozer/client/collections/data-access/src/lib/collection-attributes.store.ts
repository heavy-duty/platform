import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  CollectionAttribute,
  CollectionAttributeFilters,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { CollectionAttributeApiService } from './collection-attribute-api.service';

interface ViewModel {
  loading: boolean;
  filters: CollectionAttributeFilters | null;
  collectionAttributeIds: List<string> | null;
  collectionAttributesMap: Map<string, Document<CollectionAttribute>> | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  collectionAttributeIds: null,
  collectionAttributesMap: null,
};

@Injectable()
export class CollectionAttributesStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly collectionAttributeIds$ = this.select(
    ({ collectionAttributeIds }) => collectionAttributeIds
  );
  readonly collectionAttributesMap$ = this.select(
    ({ collectionAttributesMap }) => collectionAttributesMap
  );
  readonly collectionAttributes$ = this.select(
    this.collectionAttributesMap$,
    (collectionAttributesMap) =>
      collectionAttributesMap === null
        ? null
        : collectionAttributesMap
            .toList()
            .sort((a, b) => (b.createdAt.lt(a.createdAt) ? 1 : -1))
  );

  constructor(
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollectionAttributes(this.collectionAttributeIds$);
    this._loadCollectionAttributeIds(this.filters$);
  }

  readonly setFilters = this.updater<CollectionAttributeFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
      collectionAttributeIds: null,
      collectionAttributesMap: null,
    })
  );

  private readonly _loadCollectionAttributeIds =
    this.effect<CollectionAttributeFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({
          loading: true,
          collectionAttributesMap: null,
        });

        return this._collectionAttributeApiService.findIds(filters).pipe(
          tapResponse(
            (collectionAttributeIds) => {
              this.patchState({
                collectionAttributeIds: List(collectionAttributeIds),
              });
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  private readonly _loadCollectionAttributes = this.effect<List<string> | null>(
    switchMap((collectionAttributeIds) => {
      if (collectionAttributeIds === null) {
        return EMPTY;
      }

      return this._collectionAttributeApiService
        .findByIds(collectionAttributeIds.toArray())
        .pipe(
          tapResponse(
            (collectionAttributes) => {
              this.patchState({
                loading: false,
                collectionAttributesMap: collectionAttributes
                  .filter(
                    (
                      collectionAttribute
                    ): collectionAttribute is Document<CollectionAttribute> =>
                      collectionAttribute !== null
                  )
                  .reduce(
                    (collectionAttributesMap, collectionAttribute) =>
                      collectionAttributesMap.set(
                        collectionAttribute.id,
                        collectionAttribute
                      ),
                    Map<string, Document<CollectionAttribute>>()
                  ),
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );
}
