import { Injectable } from '@angular/core';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { generateCollectionCode } from '@heavy-duty/bulldozer-generator';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, concatMap, Observable, Subject, tap } from 'rxjs';
import {
  CollectionActions,
  CollectionCreated,
  CollectionDeleted,
  CollectionInit,
  CollectionUpdated,
} from './actions/collection.actions';
import { ApplicationStore } from './application.store';
import { WorkspaceStore } from './workspace.store';

interface ViewModel {
  collectionId: string | null;
}

const initialState: ViewModel = {
  collectionId: null,
};

@Injectable()
export class CollectionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<CollectionActions>(
    new CollectionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly collections$ = this.select(
    this._workspaceStore.collections$,
    this._applicationStore.applicationId$,
    (collections, applicationId) =>
      collections.filter(({ data }) => data.application === applicationId)
  );
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly collection$ = this.select(
    this._workspaceStore.collections$,
    this.collectionId$,
    (collections, collectionId) =>
      collections.find(({ id }) => id === collectionId) || null
  );
  readonly collectionAttributes$ = this.select(
    this._workspaceStore.collectionAttributes$,
    this.collectionId$,
    (collectionAttributes, collectionId) =>
      collectionAttributes.filter(
        ({ data: { collection } }) => collection === collectionId
      )
  );
  readonly rustCode$ = this.select(
    this.collection$,
    this.collectionAttributes$,
    (collection, collectionAttributes) =>
      collection && generateCollectionCode(collection, collectionAttributes)
  );

  constructor(
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _applicationStore: ApplicationStore
  ) {
    super(initialState);
  }

  readonly selectCollection = this.effect(
    (collectionId$: Observable<string | null>) =>
      collectionId$.pipe(
        tap((collectionId) => this.patchState({ collectionId }))
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
        concatMap((collection) => {
          const collectionData = this._workspaceStore.getCollectionData(
            collection.id
          );

          return this._bulldozerProgramStore
            .deleteCollection(
              collection.id,
              collectionData.collectionAttributes.map(({ id }) => id)
            )
            .pipe(
              tapResponse(
                () => this._events.next(new CollectionDeleted(collection.id)),
                (error) => this._error.next(error)
              )
            );
        })
      )
  );
}
