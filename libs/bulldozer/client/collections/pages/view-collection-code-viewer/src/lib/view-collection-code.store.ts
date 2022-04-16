import { Injectable } from '@angular/core';
import { generateCollectionCode2 } from '@heavy-duty/generator';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { List } from 'immutable';
import { CollectionAttributeItemView, CollectionItemView } from './types';
import { ViewCollectionCodeAttributesStore } from './view-collection-code-attributes.store';
import { ViewCollectionCodeCollectionStore } from './view-collection-code-collection.store';

interface ViewModel {
  code: string | null;
}

const initialState: ViewModel = {
  code: null,
};

@Injectable()
export class ViewCollectionCodeStore extends ComponentStore<ViewModel> {
  readonly code$ = this.select(({ code }) => code);

  constructor(
    private readonly _viewCollectionCodeCollectionStore: ViewCollectionCodeCollectionStore,
    private readonly _viewCollectionCodeAttributesStore: ViewCollectionCodeAttributesStore
  ) {
    super(initialState);

    this._loadCode(
      this.select(
        this._viewCollectionCodeCollectionStore.collection$.pipe(
          isNotNullOrUndefined
        ),
        this._viewCollectionCodeAttributesStore.collectionAttributes$.pipe(
          isNotNullOrUndefined
        ),
        (collection, collectionAttributes) => ({
          collection: collection ?? null,
          collectionAttributes: collectionAttributes,
        }),
        { debounce: true }
      )
    );
  }

  private readonly _loadCode = this.updater<{
    collection: CollectionItemView;
    collectionAttributes: List<CollectionAttributeItemView>;
  }>((state, { collection, collectionAttributes }) => ({
    ...state,
    code: generateCollectionCode2(collection, collectionAttributes),
  }));
}
