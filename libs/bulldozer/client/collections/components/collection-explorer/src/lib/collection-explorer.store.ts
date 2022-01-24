import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { CollectionStore } from '@heavy-duty/bulldozer-store';
import { EditCollectionComponent } from '@heavy-duty/bulldozer/application/features/edit-collection';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, Observable, of } from 'rxjs';
import { exhaustMap, filter, tap } from 'rxjs/operators';

interface ViewModel {
  applicationId?: string;
}

const initialState = {};

@Injectable()
export class CollectionExplorerStore extends ComponentStore<ViewModel> {
  readonly connected$ = this._walletStore.connected$;
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly collections$ = this.select(
    this._collectionStore.collections$,
    this.applicationId$,
    (collections, applicationId) =>
      collections.filter(
        (collection) => collection.data.application === applicationId
      )
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _matDialog: MatDialog
  ) {
    super(initialState);
  }

  readonly setApplicationId = this.updater(
    (state, applicationId: string | undefined) => ({
      ...state,
      applicationId,
    })
  );

  readonly createCollection = this.effect(($) =>
    combineLatest([this.applicationId$, $]).pipe(
      exhaustMap(([applicationId]) => {
        if (!applicationId) {
          return of(null);
        }

        return this._matDialog
          .open(EditCollectionComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            tap(({ name }) =>
              this._collectionStore.createCollection({
                applicationId,
                collectionName: name,
              })
            )
          );
      })
    )
  );

  readonly updateCollection = this.effect(
    (collection$: Observable<Document<Collection>>) =>
      collection$.pipe(
        exhaustMap((collection) =>
          this._matDialog
            .open(EditCollectionComponent, { data: { collection } })
            .afterClosed()
            .pipe(
              filter((changes) => changes),
              tap(({ name }) =>
                this._collectionStore.updateCollection({
                  collectionId: collection.id,
                  collectionName: name,
                })
              )
            )
        )
      )
  );

  readonly deleteCollection = this.effect(
    (collection$: Observable<Document<Collection>>) =>
      collection$.pipe(
        tap((collection) =>
          this._collectionStore.deleteCollection({
            applicationId: collection.data.application,
            collectionId: collection.id,
          })
        )
      )
  );
}
