import { Injectable } from '@angular/core';
import {
  CollectionApiService,
  CollectionSocketService,
} from '@bulldozer-client/collections-data-access';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, of, startWith, switchMap } from 'rxjs';

interface ViewModel {
  collectionId: string | null;
  collection: Document<Collection> | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  collectionId: null,
  collection: null,
  error: null,
};

@Injectable()
export class CollectionTabStore extends ComponentStore<ViewModel> {
  private readonly _collectionId$ = this.select(
    ({ collectionId }) => collectionId
  );
  readonly collection$ = this.select(({ collection }) => collection);

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionSocketService: CollectionSocketService
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
          return of(null);
        }

        return this._collectionApiService.findById(collectionId).pipe(
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
