import { Injectable } from '@angular/core';
import {
  CollectionAttributeApiService,
  CollectionAttributeSocketService,
} from '@bulldozer-client/collections-data-access';
import { NotificationStore } from '@bulldozer-client/core-data-access';
import {
  Collection,
  CollectionAttribute,
  CollectionAttributeDto,
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
  Observable,
  of,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs';
import { ViewCollectionRouteStore } from './view-collection-route.store';

interface ViewModel {
  loading: boolean;
  collectionAttributesMap: Map<string, Document<CollectionAttribute>>;
}

const initialState: ViewModel = {
  loading: false,
  collectionAttributesMap: new Map<string, Document<CollectionAttribute>>(),
};

@Injectable()
export class ViewCollectionAttributesStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
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
    private readonly _collectionAttributeSocketService: CollectionAttributeSocketService,
    private readonly _viewCollectionRouteStore: ViewCollectionRouteStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);
  }

  private readonly _setCollectionAttribute = this.updater(
    (state, newCollectionAttribute: Document<CollectionAttribute>) => {
      const collectionAttributesMap = new Map(state.collectionAttributesMap);
      collectionAttributesMap.set(
        newCollectionAttribute.id,
        newCollectionAttribute
      );
      return {
        ...state,
        collectionAttributesMap,
      };
    }
  );

  private readonly _addCollectionAttribute = this.updater(
    (state, newCollectionAttribute: Document<CollectionAttribute>) => {
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
    }
  );

  private readonly _removeCollectionAttribute = this.updater(
    (state, collectionAttributeId: string) => {
      const collectionAttributesMap = new Map(state.collectionAttributesMap);
      collectionAttributesMap.delete(collectionAttributeId);
      return {
        ...state,
        collectionAttributesMap,
      };
    }
  );

  private readonly _handleCollectionAttributeChanges = this.effect(
    (collectionAttributeId$: Observable<string>) =>
      collectionAttributeId$.pipe(
        mergeMap((collectionAttributeId) =>
          this._collectionAttributeSocketService
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
      )
  );

  protected readonly handleCollectionAttributeCreated = this.effect(() =>
    this._viewCollectionRouteStore.collectionId$.pipe(
      switchMap((collectionId) => {
        if (collectionId === null) {
          return EMPTY;
        }

        return this._collectionAttributeSocketService
          .collectionAttributeCreated({
            collection: collectionId,
          })
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
    )
  );

  protected readonly loadCollectionAttributes = this.effect(() =>
    this._viewCollectionRouteStore.collectionId$.pipe(
      tap(() => this.patchState({ loading: true })),
      switchMap((collectionId) => {
        if (collectionId === null) {
          return EMPTY;
        }

        return this._collectionAttributeApiService
          .find({
            collection: collectionId,
          })
          .pipe(
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
    )
  );

  readonly createCollectionAttribute = this.effect(
    (
      $: Observable<{
        collection: Document<Collection>;
        collectionAttributeDto: CollectionAttributeDto;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(([{ collection, collectionAttributeDto }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionAttributeApiService
            .create({
              collectionAttributeDto,
              authority: authority.toBase58(),
              workspaceId: collection.data.workspace,
              applicationId: collection.data.application,
              collectionId: collection.id,
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
        })
      )
  );

  readonly updateCollectionAttribute = this.effect(
    (
      $: Observable<{
        collectionAttributeId: string;
        collectionAttributeDto: CollectionAttributeDto;
      }>
    ) =>
      $.pipe(
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
                authority: authority?.toBase58(),
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

  readonly deleteCollectionAttribute = this.effect(
    ($: Observable<{ collectionId: string; collectionAttributeId: string }>) =>
      $.pipe(
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
