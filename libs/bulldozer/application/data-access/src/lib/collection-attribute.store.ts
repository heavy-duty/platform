import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CollectionAttribute, Document } from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { EditAttributeComponent } from '@heavy-duty/bulldozer/application/features/edit-attribute';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap, exhaustMap, filter } from 'rxjs/operators';
import {
  CollectionActions,
  CollectionAttributeCreated,
  CollectionAttributeDeleted,
  CollectionAttributeUpdated,
  CollectionInit,
} from './actions/collection.actions';

@Injectable()
export class CollectionAttributeStore extends ComponentStore<object> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<CollectionActions>(
    new CollectionInit()
  );
  readonly events$ = this._events.asObservable();

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
    super({});
  }

  readonly createCollectionAttribute = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        collectionId: string;
      }>
    ) =>
      request$.pipe(
        exhaustMap(({ workspaceId, applicationId, collectionId }) =>
          this._matDialog
            .open(EditAttributeComponent)
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap((collectionAttributeDto) =>
                this._bulldozerProgramStore.createCollectionAttribute(
                  workspaceId,
                  applicationId,
                  collectionId,
                  collectionAttributeDto
                )
              ),
              tapResponse(
                () => this._events.next(new CollectionAttributeCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateCollectionAttribute = this.effect(
    (attribute$: Observable<Document<CollectionAttribute>>) =>
      attribute$.pipe(
        exhaustMap((attribute) =>
          this._matDialog
            .open(EditAttributeComponent, {
              data: { attribute },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap((collectionAttributeDto) =>
                this._bulldozerProgramStore.updateCollectionAttribute(
                  attribute.id,
                  collectionAttributeDto
                )
              ),
              tapResponse(
                () =>
                  this._events.next(
                    new CollectionAttributeUpdated(attribute.id)
                  ),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteCollectionAttribute = this.effect(
    (attributeId$: Observable<string>) =>
      attributeId$.pipe(
        concatMap((attributeId) =>
          this._bulldozerProgramStore
            .deleteCollectionAttribute(attributeId)
            .pipe(
              tapResponse(
                () =>
                  this._events.next(
                    new CollectionAttributeDeleted(attributeId)
                  ),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );
}
