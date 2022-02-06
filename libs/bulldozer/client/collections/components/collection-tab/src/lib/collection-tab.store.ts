import { Injectable } from '@angular/core';
import {
  CollectionApiService,
  CollectionSocketService,
} from '@bulldozer-client/collections-data-access';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, Observable, of, startWith, switchMap } from 'rxjs';

interface ViewModel {
  collection: Document<Collection> | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  collection: null,
  error: null,
};

@Injectable()
export class CollectionTabStore extends ComponentStore<ViewModel> {
  readonly collection$ = this.select(({ collection }) => collection);

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionSocketService: CollectionSocketService
  ) {
    super(initialState);
  }

  readonly loadCollection$ = this.effect(
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
}
