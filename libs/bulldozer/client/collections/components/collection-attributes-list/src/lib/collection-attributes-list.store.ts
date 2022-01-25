import { Injectable } from '@angular/core';
import { CollectionAttributeStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  collectionId?: string;
}

const initialState = {};

@Injectable()
export class CollectionAttributesListStore extends ComponentStore<ViewModel> {
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly collectionAttributes$ = this.select(
    this._collectionAttributeStore.collectionAttributes$,
    this.collectionId$,
    (collectionAttributes, collectionId) =>
      collectionAttributes.filter(
        (collectionAttribute) =>
          collectionAttribute.data.collection === collectionId
      )
  );

  constructor(
    private readonly _collectionAttributeStore: CollectionAttributeStore
  ) {
    super(initialState);
  }

  readonly setCollectionId = this.updater(
    (state, collectionId: string | undefined) => ({
      ...state,
      collectionId,
    })
  );
}
