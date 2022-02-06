import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollectionApiService,
  CollectionSocketService,
} from '@bulldozer-client/collections-data-access';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { TabStore } from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

interface ViewModel {
  collection: Document<Collection> | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  collection: null,
  error: null,
};

@Injectable()
export class ViewCollectionStore extends ComponentStore<ViewModel> {
  readonly collection$ = this.select(({ collection }) => collection);

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _tabStore: TabStore,
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionSocketService: CollectionSocketService
  ) {
    super(initialState);

    this.loadCollection(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('collectionId')))
    );
  }

  protected readonly loadCollection = this.effect(
    (collectionId$: Observable<string | null>) =>
      collectionId$.pipe(
        switchMap((collectionId) => {
          if (collectionId === null) {
            return of(null);
          }

          return this._collectionApiService.findByPublicKey(collectionId).pipe(
            concatMap((collection) => {
              if (!collection) {
                return of(null);
              }

              return this._collectionSocketService
                .collectionChanges(collectionId)
                .pipe(startWith(collection));
            })
          );
        }),
        tapResponse(
          (collection) => this.patchState({ collection }),
          (error) => this.patchState({ error })
        )
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
