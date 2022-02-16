import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/core-data-access';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, startWith, switchMap } from 'rxjs';
import { CollectionApiService } from './collection-api.service';
import { CollectionEventService } from './collection-event.service';

interface ViewModel {
  collectionId: string | null;
  collection: Document<Collection> | null;
}

const initialState: ViewModel = {
  collectionId: null,
  collection: null,
};

@Injectable()
export class CollectionStore extends ComponentStore<ViewModel> {
  readonly collection$ = this.select(({ collection }) => collection);
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionEventService: CollectionEventService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollection(this.collectionId$);
  }

  private readonly _loadCollection = this.effect<string | null>(
    switchMap((collectionId) => {
      if (collectionId === null) {
        return EMPTY;
      }

      return this._collectionApiService
        .findById(collectionId)
        .pipe(
          concatMap((collection) =>
            this._collectionEventService
              .collectionChanges(collectionId)
              .pipe(startWith(collection))
          )
        )
        .pipe(
          tapResponse(
            (collection) => this.patchState({ collection }),
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );

  readonly setCollectionId = this.updater<string | null>(
    (state, collectionId) => ({
      ...state,
      collectionId,
    })
  );
}
