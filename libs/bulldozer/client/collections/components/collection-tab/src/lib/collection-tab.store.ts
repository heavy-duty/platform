import { Injectable } from '@angular/core';
import { CollectionStore } from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';
import { filter, pairwise, pipe, tap } from 'rxjs';

@Injectable()
export class CollectionTabStore extends ComponentStore<object> {
  constructor(
    private readonly _tabStore: TabStore,
    collectionStore: CollectionStore
  ) {
    super({});

    this._handleCollectionDeleted(collectionStore.collection$);
  }

  private readonly _handleCollectionDeleted =
    this.effect<Document<Collection> | null>(
      pipe(
        pairwise(),
        filter(
          ([previousCollection, currentCollection]) =>
            previousCollection !== null && currentCollection === null
        ),
        tap(([collection]) => {
          if (collection !== null) {
            this._tabStore.closeTab(collection.id);
          }
        })
      )
    );

  closeTab(tabId: string) {
    this._tabStore.closeTab(tabId);
  }
}
