import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { CollectionAttribute, Document } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { CollectionAttributeApiService } from './collection-attribute-api.service';
import { ItemView } from './types';

export type CollectionAttributeItemView = ItemView<
  Document<CollectionAttribute>
>;

interface ViewModel {
  loading: boolean;
  collectionAttributeIds: string[] | null;
  collectionAttributesMap: Map<string, CollectionAttributeItemView>;
}

const initialState: ViewModel = {
  loading: false,
  collectionAttributeIds: null,
  collectionAttributesMap: new Map<string, CollectionAttributeItemView>(),
};

@Injectable()
export class CollectionAttributesStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly collectionAttributeIds$ = this.select(
    ({ collectionAttributeIds }) => collectionAttributeIds
  );
  readonly collectionAttributesMap$ = this.select(
    ({ collectionAttributesMap }) => collectionAttributesMap
  );
  readonly collectionAttributes$ = this.select(
    this.collectionAttributesMap$,
    (collectionAttributesMap) =>
      Array.from(
        collectionAttributesMap,
        ([, collectionAttribute]) => collectionAttribute
      )
  );

  constructor(
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollectionAttributes(this.collectionAttributeIds$);
  }

  private readonly _setCollectionAttribute =
    this.updater<CollectionAttributeItemView>(
      (state, newCollectionAttribute) => {
        const collectionAttributesMap = new Map(state.collectionAttributesMap);
        collectionAttributesMap.set(
          newCollectionAttribute.document.id,
          newCollectionAttribute
        );

        return {
          ...state,
          collectionAttributesMap,
        };
      }
    );

  private readonly _patchCollectionAttributeStatuses = this.updater<{
    collectionAttributeId: string;
    statuses: {
      isCreating?: boolean;
      isUpdating?: boolean;
      isDeleting?: boolean;
    };
  }>((state, { collectionAttributeId, statuses }) => {
    const collectionAttributesMap = new Map(state.collectionAttributesMap);
    const collectionAttribute = collectionAttributesMap.get(
      collectionAttributeId
    );

    if (collectionAttribute === undefined) {
      return state;
    }

    return {
      ...state,
      collectionAttributesMap: collectionAttributesMap.set(
        collectionAttributeId,
        {
          ...collectionAttribute,
          ...statuses,
        }
      ),
    };
  });

  private readonly _removeCollectionAttribute = this.updater<string>(
    (state, collectionAttributeId) => {
      const collectionAttributesMap = new Map(state.collectionAttributesMap);
      collectionAttributesMap.delete(collectionAttributeId);
      return {
        ...state,
        collectionAttributesMap,
      };
    }
  );

  readonly setCollectionAttributeIds = this.updater<string[] | null>(
    (state, collectionAttributeIds) => ({
      ...state,
      collectionAttributeIds,
    })
  );

  private readonly _loadCollectionAttributes = this.effect<string[] | null>(
    switchMap((collectionAttributeIds) => {
      if (collectionAttributeIds === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._collectionAttributeApiService
        .findByIds(collectionAttributeIds)
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
                      collectionAttributesMap.set(collectionAttribute.id, {
                        document: collectionAttribute,
                        isCreating: false,
                        isUpdating: false,
                        isDeleting: false,
                      }),
                    new Map<string, CollectionAttributeItemView>()
                  ),
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );

  readonly handleCollectionAttributeInstruction =
    this.effect<InstructionStatus>(
      concatMap((collectionAttributeInstruction) => {
        const collectionAttributeAccountMeta =
          collectionAttributeInstruction.accounts.find(
            (account) => account.name === 'Attribute'
          );

        if (collectionAttributeAccountMeta === undefined) {
          return EMPTY;
        }

        switch (collectionAttributeInstruction.name) {
          case 'createCollectionAttribute': {
            if (collectionAttributeInstruction.status === 'finalized') {
              this._patchCollectionAttributeStatuses({
                collectionAttributeId: collectionAttributeAccountMeta.pubkey,
                statuses: {
                  isCreating: false,
                },
              });

              return EMPTY;
            }

            return this._collectionAttributeApiService
              .findById(collectionAttributeAccountMeta.pubkey, 'confirmed')
              .pipe(
                isNotNullOrUndefined,
                tapResponse(
                  (collectionAttribute) =>
                    this._setCollectionAttribute({
                      document: collectionAttribute,
                      isCreating: true,
                      isUpdating: false,
                      isDeleting: false,
                    }),
                  (error) => this._notificationStore.setError({ error })
                )
              );
          }
          case 'updateCollectionAttribute': {
            if (collectionAttributeInstruction.status === 'finalized') {
              this._patchCollectionAttributeStatuses({
                collectionAttributeId: collectionAttributeAccountMeta.pubkey,
                statuses: {
                  isUpdating: false,
                },
              });

              return EMPTY;
            }

            return this._collectionAttributeApiService
              .findById(collectionAttributeAccountMeta.pubkey, 'confirmed')
              .pipe(
                isNotNullOrUndefined,
                tapResponse(
                  (collectionAttribute) =>
                    this._setCollectionAttribute({
                      document: collectionAttribute,
                      isCreating: false,
                      isUpdating: true,
                      isDeleting: false,
                    }),
                  (error) => this._notificationStore.setError({ error })
                )
              );
          }
          case 'deleteCollectionAttribute': {
            if (collectionAttributeInstruction.status === 'confirmed') {
              this._patchCollectionAttributeStatuses({
                collectionAttributeId: collectionAttributeAccountMeta.pubkey,
                statuses: { isDeleting: true },
              });
            } else {
              this._removeCollectionAttribute(
                collectionAttributeAccountMeta.pubkey
              );
            }

            return EMPTY;
          }
          default:
            return EMPTY;
        }
      })
    );
}
