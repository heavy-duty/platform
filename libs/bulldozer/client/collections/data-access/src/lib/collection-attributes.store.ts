import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  CollectionAttribute,
  CollectionAttributeDto,
  CollectionAttributeFilters,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  first,
  mergeMap,
  of,
  pipe,
  switchMap,
  takeUntil,
  takeWhile,
  withLatestFrom,
} from 'rxjs';
import { CollectionAttributeApiService } from './collection-attribute-api.service';
import { CollectionAttributeEventService } from './collection-attribute-event.service';

interface ViewModel {
  loading: boolean;
  filters: CollectionAttributeFilters | null;
  collectionAttributesMap: Map<string, Document<CollectionAttribute>>;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  collectionAttributesMap: new Map<string, Document<CollectionAttribute>>(),
};

@Injectable()
export class CollectionAttributesStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
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
    private readonly _collectionAttributeEventService: CollectionAttributeEventService,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);

    this._loadCollectionAttributes(this.filters$);
    this._handleCollectionAttributeCreated(this.filters$);
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

  private readonly _addCollectionAttribute = this.updater<
    Document<CollectionAttribute>
  >((state, newCollectionAttribute) => {
    if (state.collectionAttributesMap.has(newCollectionAttribute.id)) {
      return state;
    }
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

  private readonly _handleCollectionAttributeChanges = this.effect<string>(
    mergeMap((collectionAttributeId) =>
      this._collectionAttributeEventService
        .collectionAttributeChanges(collectionAttributeId)
        .pipe(
          tapResponse(
            (changes) => {
              if (changes === null) {
                this._removeCollectionAttribute(collectionAttributeId);
              } else {
                this._setCollectionAttribute(changes);
              }
            },
            (error) => this._notificationStore.setError(error)
          ),
          takeUntil(
            this.loading$.pipe(
              filter((loading) => loading),
              first()
            )
          ),
          takeWhile((collection) => collection !== null)
        )
    )
  );

  private readonly _handleCollectionAttributeCreated =
    this.effect<CollectionAttributeFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        return this._collectionAttributeEventService
          .collectionAttributeCreated(filters)
          .pipe(
            tapResponse(
              (collectionAttribute) => {
                this._addCollectionAttribute(collectionAttribute);
                this._handleCollectionAttributeChanges(collectionAttribute.id);
              },
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    );

  private readonly _loadCollectionAttributes =
    this.effect<CollectionAttributeFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({ loading: true });

        return this._collectionAttributeApiService.find(filters).pipe(
          tapResponse(
            (collectionAttributes) => {
              this.patchState({
                collectionAttributesMap: collectionAttributes.reduce(
                  (collectionAttributesMap, collectionAttribute) =>
                    collectionAttributesMap.set(
                      collectionAttribute.id,
                      collectionAttribute
                    ),
                  new Map<string, Document<CollectionAttribute>>()
                ),
                loading: false,
              });
              collectionAttributes.forEach(({ id }) =>
                this._handleCollectionAttributeChanges(id)
              );
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  readonly setFilters = this.updater<CollectionAttributeFilters>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  readonly createCollectionAttribute = this.effect<{
    workspaceId: string;
    applicationId: string;
    collectionId: string;
    collectionAttributeDto: CollectionAttributeDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, collectionId, collectionAttributeDto },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionAttributeApiService
            .create({
              collectionAttributeDto,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              collectionId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Create attribute request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly updateCollectionAttribute = this.effect<{
    collectionAttributeId: string;
    collectionAttributeDto: CollectionAttributeDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ collectionAttributeId, collectionAttributeDto }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionAttributeApiService
            .update({
              collectionAttributeDto,
              authority: authority.toBase58(),
              collectionAttributeId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Update attribute request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly deleteCollectionAttribute = this.effect<{
    collectionId: string;
    collectionAttributeId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ collectionId, collectionAttributeId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collectionAttributeApiService
          .delete({
            authority: authority.toBase58(),
            collectionAttributeId,
            collectionId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Delete attribute request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
