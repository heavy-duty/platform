import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CollectionAttribute, Document } from '@heavy-duty/bulldozer-devkit';
import { CollectionAttributeStore } from '@heavy-duty/bulldozer-store';
import { RouteStore } from '@heavy-duty/bulldozer/application/data-access';
import { EditAttributeComponent } from '@heavy-duty/bulldozer/application/features/edit-attribute';
import { isTruthy } from '@heavy-duty/rx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { exhaustMap, tap } from 'rxjs/operators';

@Injectable()
export class CollectionAttributesListStore extends ComponentStore<object> {
  readonly collectionAttributes$ = this.select(
    this._collectionAttributeStore.collectionAttributes$,
    this._routeStore.collectionId$,
    (collectionAttributes, collectionId) =>
      collectionAttributes.filter(
        (collectionAttribute) =>
          collectionAttribute.data.collection === collectionId
      )
  );

  constructor(
    private readonly _collectionAttributeStore: CollectionAttributeStore,
    private readonly _matDialog: MatDialog,
    private readonly _routeStore: RouteStore
  ) {
    super({});
  }

  readonly createCollectionAttribute = this.effect(
    (
      $: Observable<{
        applicationId: string;
        collectionId: string;
      }>
    ) =>
      $.pipe(
        exhaustMap(({ applicationId, collectionId }) =>
          this._matDialog
            .open(EditAttributeComponent)
            .afterClosed()
            .pipe(
              isTruthy,
              tap((data) =>
                this._collectionAttributeStore.createCollectionAttribute({
                  applicationId,
                  collectionId,
                  collectionAttributeDto: data,
                })
              )
            )
        )
      )
  );

  readonly updateCollectionAttribute = this.effect(
    ($: Observable<{ collectionAttribute: Document<CollectionAttribute> }>) =>
      $.pipe(
        exhaustMap(({ collectionAttribute }) =>
          this._matDialog
            .open(EditAttributeComponent, { data: { collectionAttribute } })
            .afterClosed()
            .pipe(
              isTruthy,
              tap((changes) =>
                this._collectionAttributeStore.updateCollectionAttribute({
                  collectionAttributeId: collectionAttribute.id,
                  collectionAttributeDto: changes,
                })
              )
            )
        )
      )
  );

  readonly deleteCollectionAttribute = this.effect(
    ($: Observable<{ collectionAttribute: Document<CollectionAttribute> }>) =>
      $.pipe(
        tap(({ collectionAttribute }) =>
          this._collectionAttributeStore.deleteCollectionAttribute({
            collectionAttributeId: collectionAttribute.id,
            collectionId: collectionAttribute.data.collection,
          })
        )
      )
  );
}
