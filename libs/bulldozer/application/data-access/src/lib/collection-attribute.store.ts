import { Injectable } from '@angular/core';
import {
  CollectionAttribute,
  CollectionAttributeDto,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { concatMap, switchMap, tap } from 'rxjs/operators';
import {
  CollectionActions,
  CollectionAttributeCreated,
  CollectionAttributeDeleted,
  CollectionAttributeUpdated,
  CollectionInit,
} from './actions/collection.actions';

interface ViewModel {
  collectionId: string | null;
  collectionAttributesMap: Map<string, Document<CollectionAttribute>>;
}

const initialState: ViewModel = {
  collectionId: null,
  collectionAttributesMap: new Map<string, Document<CollectionAttribute>>(),
};

@Injectable()
export class CollectionAttributeStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<CollectionActions>(
    new CollectionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly collectionAttributesMap$ = this.select(
    ({ collectionAttributesMap }) => collectionAttributesMap
  );
  readonly collectionAttributes$ = this.select(
    this.collectionAttributesMap$,
    (collectionAttributesMap) =>
      Array.from(
        collectionAttributesMap,
        ([, collectionAttribute]) => collectionAttribute
      )
  );

  constructor(private readonly _bulldozerProgramStore: BulldozerProgramStore) {
    super(initialState);
  }

  private readonly _setCollectionAttribute = this.updater(
    (state, newCollectionAttribute: Document<CollectionAttribute>) => {
      const collectionAttributesMap = new Map(state.collectionAttributesMap);
      collectionAttributesMap.set(
        newCollectionAttribute.id,
        newCollectionAttribute
      );
      return {
        ...state,
        collectionAttributesMap,
      };
    }
  );

  private readonly _addCollectionAttribute = this.updater(
    (state, newCollectionAttribute: Document<CollectionAttribute>) => {
      if (state.collectionAttributesMap.has(newCollectionAttribute.id)) {
        return state;
      }
      const collectionAttributesMap = new Map(state.collectionAttributesMap);
      collectionAttributesMap.set(
        newCollectionAttribute.id,
        newCollectionAttribute
      );
      return {
        ...state,
        collectionAttributesMap,
      };
    }
  );

  private readonly _removeCollectionAttribute = this.updater(
    (state, collectionAttributeId: string) => {
      const collectionAttributesMap = new Map(state.collectionAttributesMap);
      collectionAttributesMap.delete(collectionAttributeId);
      return {
        ...state,
        collectionAttributesMap,
      };
    }
  );

  readonly setCollectionId = this.updater(
    (state, collectionId: string | null) => ({
      ...state,
      collectionId,
    })
  );

  readonly watchCollectionAttributes = this.effect(() =>
    this.collectionAttributes$.pipe(
      switchMap((collectionAttributes) =>
        merge(
          ...collectionAttributes.map((collectionAttribute) =>
            this._bulldozerProgramStore
              .onCollectionAttributeUpdated(collectionAttribute.id)
              .pipe(
                tap((changes) => {
                  if (!changes) {
                    this._removeCollectionAttribute(collectionAttribute.id);
                  } else {
                    this._setCollectionAttribute(changes);
                  }
                })
              )
          )
        )
      )
    )
  );

  readonly onCollectionAttributeByCollectionChanges = this.effect(() =>
    this.collectionId$.pipe(
      isNotNullOrUndefined,
      switchMap((collectionId) =>
        this._bulldozerProgramStore
          .onCollectionAttributeByCollectionChanges(collectionId)
          .pipe(
            tap({
              next: (collectionAttribute) =>
                this._addCollectionAttribute(collectionAttribute),
              complete: () => console.log('do I complete?'),
            })
          )
      )
    )
  );

  readonly loadCollectionAttributes = this.effect(() =>
    this.collectionId$.pipe(
      isNotNullOrUndefined,
      concatMap((collectionId) =>
        this._bulldozerProgramStore
          .getCollectionAttributesByCollection(collectionId)
          .pipe(
            tapResponse(
              (collectionAttributes) =>
                this.patchState({
                  collectionAttributesMap: collectionAttributes.reduce(
                    (collectionAttributesMap, collectionAttribute) =>
                      collectionAttributesMap.set(
                        collectionAttribute.id,
                        collectionAttribute
                      ),
                    new Map<string, Document<CollectionAttribute>>()
                  ),
                }),
              (error) => this._error.next(error)
            )
          )
      )
    )
  );

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

  reload() {
    // this._reload.next(null);
  }
}
