import { Injectable } from '@angular/core';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  concatMap,
  merge,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import {
  CollectionActions,
  CollectionCreated,
  CollectionDeleted,
  CollectionInit,
  CollectionUpdated,
} from './actions/collection.actions';

interface ViewModel {
  applicationId: string | null;
  collectionId: string | null;
  collectionsMap: Map<string, Document<Collection>>;
}

const initialState: ViewModel = {
  applicationId: null,
  collectionId: null,
  collectionsMap: new Map<string, Document<Collection>>(),
};

@Injectable()
export class CollectionStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<CollectionActions>(
    new CollectionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly collectionsMap$ = this.select(
    ({ collectionsMap }) => collectionsMap
  );
  readonly collections$ = this.select(this.collectionsMap$, (collectionsMap) =>
    Array.from(collectionsMap, ([, collection]) => collection)
  );
  readonly collection$ = this.select(
    this.collectionsMap$,
    this.collectionId$,
    (collections, collectionId) =>
      (collectionId && collections.get(collectionId)) || null
  );

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
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

  readonly setCollectionId = this.updater(
    (state, collectionId: string | null) => ({
      ...state,
      collectionId,
    })
  );

  readonly setApplicationId = this.updater(
    (state, applicationId: string | null) => ({
      ...state,
      applicationId,
    })
  );

  readonly watchCollections = this.effect(() =>
    this.collections$.pipe(
      switchMap((collections) =>
        merge(
          ...collections.map((collection) =>
            this._bulldozerProgramStore.onCollectionUpdated(collection.id).pipe(
              tap((changes) => {
                if (!changes) {
                  this._removeCollection(collection.id);
                } else {
                  this._setCollection(changes);
                }
              })
            )
          )
        )
      )
    )
  );

  readonly onCollectionByApplicationChanges = this.effect(() =>
    this.applicationId$.pipe(
      isNotNullOrUndefined,
      switchMap((applicationId) =>
        this._bulldozerProgramStore
          .onCollectionsChanges({ application: applicationId })
          .pipe(tap((collection) => this._addCollection(collection)))
      )
    )
  );

  readonly loadCollections = this.effect(() =>
    this.applicationId$.pipe(
      isNotNullOrUndefined,
      concatMap((applicationId) =>
        this._bulldozerProgramStore
          .getCollections({ application: applicationId })
          .pipe(
            tapResponse(
              (collections) =>
                this.patchState({
                  collectionsMap: collections.reduce(
                    (collectionsMap, collection) =>
                      collectionsMap.set(collection.id, collection),
                    new Map<string, Document<Collection>>()
                  ),
                }),
              (error) => this._error.next(error)
            )
          )
      )
    )
  );

  readonly createCollection = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        data: { name: string };
      }>
    ) =>
      request$.pipe(
        concatMap(({ workspaceId, applicationId, data }) =>
          this._bulldozerProgramStore
            .createCollection(workspaceId, applicationId, data.name)
            .pipe(
              tapResponse(
                () => this._events.next(new CollectionCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateCollection = this.effect(
    (
      collection$: Observable<{
        collection: Document<Collection>;
        changes: { name: string };
      }>
    ) =>
      collection$.pipe(
        concatMap(({ collection, changes }) =>
          this._bulldozerProgramStore
            .updateCollection(collection.id, changes.name)
            .pipe(
              tapResponse(
                () => this._events.next(new CollectionUpdated(collection.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteCollection = this.effect(
    (collection$: Observable<Document<Collection>>) =>
      collection$.pipe(
        concatMap((collection) =>
          this._bulldozerProgramStore
            .deleteCollection(collection.data.application, collection.id)
            .pipe(
              tapResponse(
                () => this._events.next(new CollectionDeleted(collection.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  reload() {
    // this._reload.next(null);
  }
}
