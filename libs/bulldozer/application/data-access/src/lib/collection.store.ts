import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { generateCollectionCode } from '@heavy-duty/bulldozer-generator';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { EditCollectionComponent } from '@heavy-duty/bulldozer/application/features/edit-collection';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  concatMap,
  exhaustMap,
  filter,
  Observable,
  Subject,
  tap,
} from 'rxjs';
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
    private readonly _matDialog: MatDialog,
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
    (request$: Observable<{ workspaceId: string; applicationId: string }>) =>
      request$.pipe(
        exhaustMap(({ workspaceId, applicationId }) =>
          this._matDialog
            .open(EditCollectionComponent)
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name }) =>
                this._bulldozerProgramStore.createCollection(
                  workspaceId,
                  applicationId,
                  name
                )
              ),
              tapResponse(
                () => this._events.next(new CollectionCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateCollection = this.effect(
    (collection$: Observable<Document<Collection>>) =>
      collection$.pipe(
        exhaustMap((collection) =>
          this._matDialog
            .open(EditCollectionComponent, { data: { collection } })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name }) =>
                this._bulldozerProgramStore.updateCollection(
                  collection.id,
                  name
                )
              ),
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
