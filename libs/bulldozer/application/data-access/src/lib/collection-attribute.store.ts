import { Injectable } from '@angular/core';
import {
  CollectionAttribute,
  CollectionAttributeDto,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
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

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
    super({});
  }

  readonly createCollectionAttribute = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        collectionId: string;
        data: CollectionAttributeDto;
      }>
    ) =>
      request$.pipe(
        concatMap(({ workspaceId, applicationId, collectionId, data }) =>
          this._bulldozerProgramStore
            .createCollectionAttribute(
              workspaceId,
              applicationId,
              collectionId,
              data
            )
            .pipe(
              tapResponse(
                () => this._events.next(new CollectionAttributeCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateCollectionAttribute = this.effect(
    (
      request$: Observable<{
        collectionAttribute: Document<CollectionAttribute>;
        changes: CollectionAttributeDto;
      }>
    ) =>
      request$.pipe(
        concatMap(({ collectionAttribute, changes }) =>
          this._bulldozerProgramStore
            .updateCollectionAttribute(collectionAttribute.id, changes)
            .pipe(
              tapResponse(
                () =>
                  this._events.next(
                    new CollectionAttributeUpdated(collectionAttribute.id)
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
