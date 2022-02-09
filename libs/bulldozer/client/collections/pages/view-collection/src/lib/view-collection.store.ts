import { Injectable } from '@angular/core';
import {
  CollectionApiService,
  CollectionSocketService,
} from '@bulldozer-client/collections-data-access';
import { NotificationStore } from '@bulldozer-client/notification-store';
import { TabStore } from '@bulldozer-client/tab-store';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs-operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, startWith, switchMap, tap } from 'rxjs';
import { ViewCollectionRouteStore } from './view-collection-route.store';

interface ViewModel {
  collection: Document<Collection> | null;
}

const initialState: ViewModel = {
  collection: null,
};

@Injectable()
export class ViewCollectionStore extends ComponentStore<ViewModel> {
  readonly collection$ = this.select(({ collection }) => collection);

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionSocketService: CollectionSocketService,
    private readonly _viewCollectionRouteStore: ViewCollectionRouteStore,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);
  }

  protected readonly loadCollection = this.effect(() =>
    this._viewCollectionRouteStore.collectionId$.pipe(
      switchMap((collectionId) => {
        if (collectionId === null) {
          return EMPTY;
        }

        return this._collectionApiService
          .findById(collectionId)
          .pipe(
            concatMap((collection) =>
              this._collectionSocketService
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
    )
  );

  protected readonly openTab = this.effect(() =>
    this.collection$.pipe(
      isNotNullOrUndefined,
      tap((collection) =>
        this._tabStore.openTab({
          id: collection.id,
          kind: 'collection',
          url: `/workspaces/${collection.data.workspace}/applications/${collection.data.application}/collections/${collection.id}`,
        })
      )
    )
  );
}
