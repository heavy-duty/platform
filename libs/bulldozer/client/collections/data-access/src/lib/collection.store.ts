import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { CollectionApiService } from './collection-api.service';

interface ViewModel {
  loading: boolean;
  collectionId: string | null;
  collection: Document<Collection> | null;
}

const initialState: ViewModel = {
  loading: false,
  collectionId: null,
  collection: null,
};

@Injectable()
export class CollectionStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly collection$ = this.select(({ collection }) => collection);

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollection(this.collectionId$);
  }

  readonly setCollectionId = this.updater<string | null>(
    (state, collectionId) => ({
      ...state,
      collectionId,
    })
  );

  private readonly _loadCollection = this.effect<string | null>(
    switchMap((collectionId) => {
      if (collectionId === null) {
        return EMPTY;
      }

      this.patchState({ loading: true, collection: null });

      return this._collectionApiService.findById(collectionId).pipe(
        tapResponse(
          (collection) => {
            this.patchState({
              loading: false,
              collection,
            });
          },
          (error) => this._notificationStore.setError({ error })
        )
      );
    })
  );
}
