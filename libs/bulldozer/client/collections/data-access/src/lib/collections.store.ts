import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Collection,
  CollectionFilters,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  mergeMap,
  of,
  pipe,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  withLatestFrom,
} from 'rxjs';
import { CollectionApiService } from './collection-api.service';
import { CollectionEventService } from './collection-event.service';

interface ViewModel {
  loading: boolean;
  collectionsMap: Map<string, Document<Collection>>;
  filters: CollectionFilters | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  collectionsMap: new Map<string, Document<Collection>>(),
};

@Injectable()
export class CollectionsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly collectionsMap$ = this.select(
    ({ collectionsMap }) => collectionsMap
  );
  readonly collections$ = this.select(this.collectionsMap$, (collectionsMap) =>
    Array.from(collectionsMap, ([, collection]) => collection)
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionEventService: CollectionEventService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._handleCollectionCreated(this.filters$);
    this._loadCollections(this.filters$);
  }

  private readonly _setCollection = this.updater<Document<Collection>>(
    (state, newCollection) => {
      const collectionsMap = new Map(state.collectionsMap);
      collectionsMap.set(newCollection.id, newCollection);
      return {
        ...state,
        collectionsMap,
      };
    }
  );

  private readonly _addCollection = this.updater<Document<Collection>>(
    (state, newCollection) => {
      if (state.collectionsMap.has(newCollection.id)) {
        return state;
      }
      const collectionsMap = new Map(state.collectionsMap);
      collectionsMap.set(newCollection.id, newCollection);
      return {
        ...state,
        collectionsMap,
      };
    }
  );

  private readonly _removeCollection = this.updater<string>(
    (state, collectionId) => {
      const collectionsMap = new Map(state.collectionsMap);
      collectionsMap.delete(collectionId);
      return {
        ...state,
        collectionsMap,
      };
    }
  );

  private readonly _handleCollectionChanges = this.effect<string>(
    mergeMap((collectionId) =>
      this._collectionEventService.collectionChanges(collectionId).pipe(
        tapResponse(
          (changes) => {
            if (changes === null) {
              this._removeCollection(collectionId);
            } else {
              this._setCollection(changes);
            }
          },
          (error) => this._notificationStore.setError(error)
        ),
        takeUntil(
          this.loading$.pipe(
            filter((loading) => loading),
            take(1)
          )
        ),
        takeWhile((collection) => collection !== null)
      )
    )
  );

  private readonly _handleCollectionCreated =
    this.effect<CollectionFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        return this._collectionEventService.collectionCreated(filters).pipe(
          tapResponse(
            (collection) => {
              this._addCollection(collection);
              this._handleCollectionChanges(collection.id);
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  private readonly _loadCollections = this.effect<CollectionFilters | null>(
    switchMap((filters) => {
      if (filters === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._collectionApiService.find(filters).pipe(
        tapResponse(
          (collections) => {
            this.patchState({
              collectionsMap: collections.reduce(
                (collectionsMap, collection) =>
                  collectionsMap.set(collection.id, collection),
                new Map<string, Document<Collection>>()
              ),
              loading: false,
            });
            collections.forEach(({ id }) => this._handleCollectionChanges(id));
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

  readonly createCollection = this.effect<{
    workspaceId: string;
    applicationId: string;
    collectionName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ collectionName, workspaceId, applicationId }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionApiService
            .create({
              collectionName,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Create collection request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly updateCollection = this.effect<{
    collectionId: string;
    collectionName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ collectionId, collectionName }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collectionApiService
          .update({
            collectionName,
            authority: authority.toBase58(),
            collectionId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Update collection request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly deleteCollection = this.effect<{
    applicationId: string;
    collectionId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ collectionId, applicationId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collectionApiService
          .delete({
            authority: authority.toBase58(),
            collectionId,
            applicationId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Delete collection request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
