import { Injectable } from '@angular/core';
import {
  CollectionApiService,
  CollectionSocketService,
} from '@bulldozer-client/collections-data-access';
import { NotificationStore } from '@bulldozer-client/notification-store';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
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

interface ViewModel {
  loading: boolean;
  workspaceId: string | null;
  applicationId: string | null;
  collectionsMap: Map<string, Document<Collection>>;
}

const initialState: ViewModel = {
  loading: false,
  workspaceId: null,
  applicationId: null,
  collectionsMap: new Map<string, Document<Collection>>(),
};

@Injectable()
export class CollectionExplorerStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly collectionsMap$ = this.select(
    ({ collectionsMap }) => collectionsMap
  );
  readonly collections$ = this.select(this.collectionsMap$, (collectionsMap) =>
    Array.from(collectionsMap, ([, collection]) => collection)
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionSocketService: CollectionSocketService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);
  }

  private readonly _setCollection = this.updater(
    (state, newCollection: Document<Collection>) => {
      const collectionsMap = new Map(state.collectionsMap);
      collectionsMap.set(newCollection.id, newCollection);
      return {
        ...state,
        collectionsMap,
      };
    }
  );

  private readonly _addCollection = this.updater(
    (state, newCollection: Document<Collection>) => {
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

  private readonly _removeCollection = this.updater(
    (state, collectionId: string) => {
      const collectionsMap = new Map(state.collectionsMap);
      collectionsMap.delete(collectionId);
      return {
        ...state,
        collectionsMap,
      };
    }
  );

  readonly setApplicationId = this.updater(
    (state, applicationId: string | null) => ({ ...state, applicationId })
  );

  readonly setWorkspaceId = this.updater(
    (state, workspaceId: string | null) => ({ ...state, workspaceId })
  );

  private readonly _handleCollectionChanges = this.effect(
    (collectionId$: Observable<string>) =>
      collectionId$.pipe(
        mergeMap((collectionId) =>
          this._collectionSocketService.collectionChanges(collectionId).pipe(
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
                first()
              )
            ),
            takeWhile((collection) => collection !== null)
          )
        )
      )
  );

  protected readonly handleCollectionCreated = this.effect(() =>
    this.applicationId$.pipe(
      switchMap((applicationId) => {
        if (applicationId === null) {
          return of(null);
        }

        return this._collectionSocketService
          .collectionCreated({
            application: applicationId,
          })
          .pipe(
            tapResponse(
              (collection) => {
                this._addCollection(collection);
                this._handleCollectionChanges(collection.id);
              },
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  protected readonly loadCollections = this.effect(() =>
    this.applicationId$.pipe(
      tap(() => this.patchState({ loading: true })),
      switchMap((applicationId) => {
        if (applicationId === null) {
          return of([]);
        }

        return this._collectionApiService.find({ application: applicationId });
      }),
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
    )
  );

  readonly createCollection = this.effect(
    ($: Observable<{ collectionName: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this.workspaceId$,
              this.applicationId$,
              this._walletStore.publicKey$
            )
          )
        ),
        concatMap(
          ([{ collectionName }, workspaceId, applicationId, authority]) => {
            if (
              workspaceId === null ||
              applicationId === null ||
              authority === null
            ) {
              return EMPTY;
            }

            return this._collectionApiService.create({
              collectionName,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
            });
          }
        ),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Create collection request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );

  readonly updateCollection = this.effect(
    (
      $: Observable<{
        collectionId: string;
        collectionName: string;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(([{ collectionId, collectionName }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionApiService.update({
            collectionName,
            authority: authority?.toBase58(),
            collectionId,
          });
        }),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Update collection request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );

  readonly deleteCollection = this.effect(
    ($: Observable<{ collectionId: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(this.applicationId$, this._walletStore.publicKey$)
          )
        ),
        concatMap(([{ collectionId }, applicationId, authority]) => {
          if (applicationId === null || authority === null) {
            return EMPTY;
          }

          return this._collectionApiService.delete({
            authority: authority.toBase58(),
            collectionId,
            applicationId,
          });
        }),
        tapResponse(
          () =>
            this._notificationStore.setEvent('Delete collection request sent'),
          (error) => this._notificationStore.setError(error)
        )
      )
  );
}
