import { Injectable } from '@angular/core';
import { CollectionStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  applicationId?: string;
}

const initialState = {};

@Injectable()
export class CollectionExplorerStore extends ComponentStore<ViewModel> {
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly collections$ = this.select(
    this._collectionStore.collections$,
    this.applicationId$,
    (collections, applicationId) =>
      collections.filter(
        (collection) => collection.data.application === applicationId
      )
  );

  constructor(private readonly _collectionStore: CollectionStore) {
    super(initialState);
  }

  readonly setApplicationId = this.updater(
    (state, applicationId: string | undefined) => ({
      ...state,
      applicationId,
    })
  );
}
