import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { CollectionAttribute, Document } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, Observable, switchMap } from 'rxjs';
import { CollectionAttributeApiService } from './collection-attribute-api.service';
import { ItemView } from './types';

export type CollectionAttributeItemView = ItemView<
  Document<CollectionAttribute>
>;

interface ItemStatus {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

interface ViewModel {
  loading: boolean;
  collectionAttributeIds: string[] | null;
  collectionAttributesMap: Map<string, Document<CollectionAttribute>>;
  collectionAttributeStatusesMap: Map<string, ItemStatus>;
}

const initialState: ViewModel = {
  loading: false,
  collectionAttributeIds: null,
  collectionAttributesMap: new Map<string, Document<CollectionAttribute>>(),
  collectionAttributeStatusesMap: new Map<string, ItemStatus>(),
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
  readonly collectionAttributeStatusesMap$ = this.select(
    ({ collectionAttributeStatusesMap }) => collectionAttributeStatusesMap
  );
  readonly collectionAttributes$: Observable<CollectionAttributeItemView[]> =
    this.select(
      this.collectionAttributesMap$,
      this.collectionAttributeStatusesMap$,
      (collectionAttributesMap, collectionAttributeStatusesMap) =>
        Array.from(
          collectionAttributesMap,
          ([collectionAttributeId, collectionAttribute]) => ({
            document: collectionAttribute,
            ...(collectionAttributeStatusesMap.get(collectionAttributeId) ?? {
              isCreating: false,
              isUpdating: false,
              isDeleting: false,
            }),
          })
        )
    );

  constructor(
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollectionAttributes(this.collectionAttributeIds$);
  }

  private readonly _setCollectionAttribute = this.updater<
    Document<CollectionAttribute>
  >((state, newCollectionAttribute) => {
    const collectionAttributesMap = new Map(state.collectionAttributesMap);
    collectionAttributesMap.set(
      newCollectionAttribute.id,
      newCollectionAttribute
    );

    return {
      ...state,
      collectionAttributesMap,
    };
  });

  private readonly _setCollectionAttributesMap = this.updater<
    Map<string, Document<CollectionAttribute>>
  >((state, newCollectionAttributesMap) => {
    const collectionAttributesMap = new Map(state.collectionAttributesMap);

    newCollectionAttributesMap.forEach((newCollectionAttribute) => {
      collectionAttributesMap.set(
        newCollectionAttribute.id,
        newCollectionAttribute
      );
    });

    return { ...state, collectionAttributesMap };
  });

  private readonly _patchStatus = this.updater<{
    collectionAttributeId: string;
    statuses: {
      isCreating?: boolean;
      isUpdating?: boolean;
      isDeleting?: boolean;
    };
  }>((state, { collectionAttributeId, statuses }) => {
    const collectionAttributeStatusesMap = new Map(
      state.collectionAttributeStatusesMap
    );
    const collectionAttributeStatus = collectionAttributeStatusesMap.get(
      collectionAttributeId
    );

    return {
      ...state,
      collectionAttributeStatusesMap: collectionAttributeStatusesMap.set(
        collectionAttributeId,
        {
          ...(collectionAttributeStatus === undefined
            ? { isCreating: false, isUpdating: false, isDeleting: false }
            : collectionAttributeStatus),
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
              this._setCollectionAttributesMap(
                collectionAttributes
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
                    new Map<string, Document<CollectionAttribute>>()
                  )
              );
              this.patchState({
                loading: false,
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );

  readonly setCollectionAttributeIds = this.updater<string[] | null>(
    (state, collectionAttributeIds) => ({
      ...state,
      collectionAttributeIds,
    })
  );

  readonly dispatch = this.effect<InstructionStatus>(
    concatMap((instructionStatus) => {
      const collectionAttributeAccountMeta = instructionStatus.accounts.find(
        (account) => account.name === 'Attribute'
      );

      if (collectionAttributeAccountMeta === undefined) {
        return EMPTY;
      }

      switch (instructionStatus.name) {
        case 'createCollectionAttribute': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({
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
                (collectionAttribute) => {
                  this._setCollectionAttribute(collectionAttribute);
                  this._patchStatus({
                    collectionAttributeId:
                      collectionAttributeAccountMeta.pubkey,
                    statuses: {
                      isCreating: true,
                    },
                  });
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateCollectionAttribute': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({
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
                (collectionAttribute) => {
                  this._setCollectionAttribute(collectionAttribute);
                  this._patchStatus({
                    collectionAttributeId:
                      collectionAttributeAccountMeta.pubkey,
                    statuses: {
                      isUpdating: true,
                    },
                  });
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteCollectionAttribute': {
          if (instructionStatus.status === 'confirmed') {
            this._patchStatus({
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
