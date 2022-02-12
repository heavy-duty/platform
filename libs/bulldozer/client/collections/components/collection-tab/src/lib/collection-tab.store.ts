import { Injectable } from '@angular/core';
import {
  CollectionApiService,
  CollectionEventService,
} from '@bulldozer-client/collections-data-access';
import { NotificationStore } from '@bulldozer-client/core-data-access';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, startWith, switchMap } from 'rxjs';

interface ViewModel {
  collectionId: string | null;
  collection: Document<Collection> | null;
}

const initialState: ViewModel = {
  collectionId: null,
  collection: null,
};

@Injectable()
export class CollectionTabStore extends ComponentStore<ViewModel> {
  private readonly _collectionId$ = this.select(
    ({ collectionId }) => collectionId
  );
  readonly collection$ = this.select(({ collection }) => collection);

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionEventService: CollectionEventService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);
  }

  readonly setCollectionId = this.updater(
    (state, collectionId: string | null) => ({ ...state, collectionId })
  );

  protected readonly loadCollection = this.effect(() =>
    this._collectionId$.pipe(
      switchMap((collectionId) => {
        if (collectionId === null) {
          return EMPTY;
        }

        return this._collectionApiService.findById(collectionId).pipe(
          concatMap((collection) =>
            this._collectionEventService
              .collectionChanges(collectionId)
              .pipe(startWith(collection))
          ),
          tapResponse(
            (collection) => this.patchState({ collection }),
            (error) => this._notificationStore.setError({ error })
          )
        );
      })
    )
  );
}
