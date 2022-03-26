import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { CollectionApiService } from './collection-api.service';
import { ItemView } from './types';

export type CollectionItemView = ItemView<Document<Collection>>;

interface ViewModel {
  loading: boolean;
  collectionIds: string[] | null;
  collectionsMap: Map<string, CollectionItemView>;
}

const initialState: ViewModel = {
  loading: false,
  collectionIds: null,
  collectionsMap: new Map<string, CollectionItemView>(),
};

@Injectable()
export class CollectionsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly collectionIds$ = this.select(({ collectionIds }) => collectionIds);
  readonly collectionsMap$ = this.select(
    ({ collectionsMap }) => collectionsMap
  );
  readonly collections$ = this.select(this.collectionsMap$, (collectionsMap) =>
    Array.from(collectionsMap, ([, collection]) => collection)
  );

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollections(this.collectionIds$);
  }

  private readonly _setCollection = this.updater<CollectionItemView>(
    (state, newCollection) => {
      const collectionsMap = new Map(state.collectionsMap);
      collectionsMap.set(newCollection.document.id, newCollection);

      return {
        ...state,
        collectionsMap,
      };
    }
  );

  private readonly _patchCollectionStatuses = this.updater<{
    collectionId: string;
    statuses: {
      isCreating?: boolean;
      isUpdating?: boolean;
      isDeleting?: boolean;
    };
  }>((state, { collectionId, statuses }) => {
    const collectionsMap = new Map(state.collectionsMap);
    const collection = collectionsMap.get(collectionId);

    if (collection === undefined) {
      return state;
    }

    return {
      ...state,
      collectionsMap: collectionsMap.set(collectionId, {
        ...collection,
        ...statuses,
      }),
    };
  });

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

  private readonly _loadCollections = this.effect<string[] | null>(
    switchMap((collectionIds) => {
      if (collectionIds === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._collectionApiService.findByIds(collectionIds).pipe(
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
                    collectionsMap.set(collection.id, {
                      document: collection,
                      isCreating: false,
                      isUpdating: false,
                      isDeleting: false,
                    }),
                  new Map<string, CollectionItemView>()
                ),
            });
          },
          (error) => this._notificationStore.setError({ error })
        )
      );
    })
  );

  readonly setCollectionIds = this.updater<string[] | null>(
    (state, collectionIds) => ({
      ...state,
      collectionIds,
    })
  );

  readonly handleCollectionInstruction = this.effect<InstructionStatus>(
    concatMap((collectionInstruction) => {
      const collectionAccountMeta = collectionInstruction.accounts.find(
        (account) => account.name === 'Collection'
      );

      if (collectionAccountMeta === undefined) {
        return EMPTY;
      }

      switch (collectionInstruction.name) {
        case 'createCollection': {
          if (collectionInstruction.status === 'finalized') {
            this._patchCollectionStatuses({
              collectionId: collectionAccountMeta.pubkey,
              statuses: {
                isCreating: false,
              },
            });

            return EMPTY;
          }

          return this._collectionApiService
            .findById(collectionAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (collection) =>
                  this._setCollection({
                    document: collection,
                    isCreating: true,
                    isUpdating: false,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateCollection': {
          if (collectionInstruction.status === 'finalized') {
            this._patchCollectionStatuses({
              collectionId: collectionAccountMeta.pubkey,
              statuses: {
                isUpdating: false,
              },
            });

            return EMPTY;
          }

          return this._collectionApiService
            .findById(collectionAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (collection) =>
                  this._setCollection({
                    document: collection,
                    isCreating: false,
                    isUpdating: true,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteCollection': {
          if (collectionInstruction.status === 'confirmed') {
            this._patchCollectionStatuses({
              collectionId: collectionAccountMeta.pubkey,
              statuses: { isDeleting: true },
            });
          } else {
            this._removeCollection(collectionAccountMeta.pubkey);
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );
}
