import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { CollectionStore } from '@heavy-duty/bulldozer/application/data-access';
import { EditCollectionComponent } from '@heavy-duty/bulldozer/application/features/edit-collection';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { exhaustMap, filter, tap } from 'rxjs/operators';

@Injectable()
export class CollectionExplorerStore extends ComponentStore<object> {
  readonly connected$ = this._walletStore.connected$;
  readonly collections$ = this._collectionStore.collections$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _matDialog: MatDialog
  ) {
    super({});
  }

  readonly createCollection = this.effect(
    (request$: Observable<{ workspaceId: string; applicationId: string }>) =>
      request$.pipe(
        exhaustMap(({ workspaceId, applicationId }) =>
          this._matDialog
            .open(EditCollectionComponent)
            .afterClosed()
            .pipe(
              filter((data) => data),
              tap((data) =>
                this._collectionStore.createCollection({
                  workspaceId,
                  applicationId,
                  data,
                })
              )
            )
        )
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
              tap((changes) =>
                this._collectionStore.updateCollection({
                  collection,
                  changes,
                })
              )
            )
        )
      )
  );

  readonly deleteCollection = this.effect(
    (collection$: Observable<Document<Collection>>) =>
      collection$.pipe(
        tap((collection) => this._collectionStore.deleteCollection(collection))
      )
  );
}
