import { Injectable } from '@angular/core';
import {
  CollectionApiService,
  CollectionSocketService,
} from '@bulldozer-client/collections-data-access';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  filter,
  first,
  mergeMap,
  Observable,
  of,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import { ViewInstructionNotificationStore } from './view-instruction-notification.store';
import { ViewInstructionStore } from './view-instruction.store';

interface ViewModel {
  loading: boolean;
  collectionsMap: Map<string, Document<Collection>>;
}

const initialState: ViewModel = {
  loading: false,
  collectionsMap: new Map<string, Document<Collection>>(),
};

@Injectable()
export class ViewCollectionsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly collectionsMap$ = this.select(
    ({ collectionsMap }) => collectionsMap
  );
  readonly collections$ = this.select(this.collectionsMap$, (collectionsMap) =>
    Array.from(collectionsMap, ([, collection]) => collection)
  );

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionSocketService: CollectionSocketService,
    private readonly _viewInstructionStore: ViewInstructionStore,
    private readonly _viewInstructionNotificationStore: ViewInstructionNotificationStore
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
              (error) => this._viewInstructionNotificationStore.setError(error)
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
    this._viewInstructionStore.instruction$.pipe(
      switchMap((instruction) => {
        if (instruction === null) {
          return of(null);
        }

        return this._collectionSocketService
          .collectionCreated({
            application: instruction.data.application,
          })
          .pipe(
            tapResponse(
              (collection) => {
                this._addCollection(collection);
                this._handleCollectionChanges(collection.id);
              },
              (error) => this._viewInstructionNotificationStore.setError(error)
            )
          );
      })
    )
  );

  protected readonly loadCollections = this.effect(() =>
    this._viewInstructionStore.instruction$.pipe(
      tap(() => this.patchState({ loading: true })),
      switchMap((instruction) => {
        if (instruction === null) {
          return of([]);
        }

        return this._collectionApiService.find({
          application: instruction.data.application,
        });
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
        (error) => this._viewInstructionNotificationStore.setError(error)
      )
    )
  );
}
