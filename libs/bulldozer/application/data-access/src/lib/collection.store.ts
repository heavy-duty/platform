import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditAttributeComponent } from '@heavy-duty/bulldozer/application/features/edit-attribute';
import { EditCollectionComponent } from '@heavy-duty/bulldozer/application/features/edit-collection';
import {
  Collection,
  CollectionAttribute,
  ProgramStore,
} from '@heavy-duty/bulldozer/data-access';
import { generateCollectionRustCode } from '@heavy-duty/code-generator';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { ApplicationStore } from './application.store';

interface ViewModel {
  collections: Collection[];
  collectionId: string | null;
  attributes: CollectionAttribute[];
}

const initialState = {
  collections: [],
  collectionId: null,
  attributes: [],
};

@Injectable()
export class CollectionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  readonly collections$ = this.select(({ collections }) => collections);
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly attributes$ = this.select(({ attributes }) => attributes);
  readonly rustCode$ = this.select(
    this.collections$,
    this.collectionId$,
    this.attributes$,
    (collections, collectionId, attributes) => {
      const collection = collections.find(
        (collection) => collection.id === collectionId
      );

      return generateCollectionRustCode(collection, attributes);
    }
  );

  constructor(
    private readonly _programStore: ProgramStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _matDialog: MatDialog
  ) {
    super(initialState);
  }

  readonly loadCollections = this.effect(() =>
    combineLatest([
      this.reload$,
      this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
    ]).pipe(
      switchMap(([, applicationId]) =>
        this._programStore.getCollections(applicationId).pipe(
          tapResponse(
            (collections) => this.patchState({ collections }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly loadAttributes = this.effect(() =>
    combineLatest([
      this.reload$,
      this.collectionId$.pipe(isNotNullOrUndefined),
    ]).pipe(
      concatMap(([, collectionId]) =>
        this._programStore.getCollectionAttributes(collectionId).pipe(
          tapResponse(
            (attributes) => this.patchState({ attributes }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly selectCollection = this.effect(
    (collectionId$: Observable<string | null>) =>
      collectionId$.pipe(
        tap((collectionId) => this.patchState({ collectionId }))
      )
  );

  readonly createCollection = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditCollectionComponent)
          .afterClosed()
          .pipe(
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name }, applicationId]) =>
              this._programStore.createCollection(applicationId, name).pipe(
                tapResponse(
                  () => this._reload.next(null),
                  (error) => this._error.next(error)
                )
              )
            )
          )
      )
    )
  );

  readonly updateCollection = this.effect(
    (collection$: Observable<Collection>) =>
      collection$.pipe(
        exhaustMap((collection) =>
          this._matDialog
            .open(EditCollectionComponent, { data: { collection } })
            .afterClosed()
            .pipe(
              concatMap(({ name }) =>
                this._programStore.updateCollection(collection.id, name).pipe(
                  tapResponse(
                    () => this._reload.next(null),
                    (error) => this._error.next(error)
                  )
                )
              )
            )
        )
      )
  );

  readonly deleteCollection = this.effect((collectionId$: Observable<string>) =>
    collectionId$.pipe(
      concatMap((collectionId) =>
        this._programStore.deleteCollection(collectionId).pipe(
          tapResponse(
            () => this._reload.next(null),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly createCollectionAttribute = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(
            this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
            this.collectionId$.pipe(isNotNullOrUndefined)
          )
        )
      ),
      exhaustMap(([, applicationId, collectionId]) =>
        this._matDialog
          .open(EditAttributeComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            concatMap(({ name, kind, modifier, size }) =>
              this._programStore
                .createCollectionAttribute(
                  applicationId,
                  collectionId,
                  name,
                  kind,
                  modifier,
                  size
                )
                .pipe(
                  tapResponse(
                    () => this._reload.next(null),
                    (error) => this._error.next(error)
                  )
                )
            )
          )
      )
    )
  );

  readonly updateCollectionAttribute = this.effect(
    (attribute$: Observable<CollectionAttribute>) =>
      attribute$.pipe(
        exhaustMap((attribute) =>
          this._matDialog
            .open(EditAttributeComponent, {
              data: { attribute },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name, kind, modifier, size }) =>
                this._programStore
                  .updateCollectionAttribute(
                    attribute.id,
                    name,
                    kind,
                    modifier,
                    size
                  )
                  .pipe(
                    tapResponse(
                      () => this._reload.next(null),
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly deleteCollectionAttribute = this.effect(
    (attributeId$: Observable<string>) =>
      attributeId$.pipe(
        concatMap((attributeId) =>
          this._programStore.deleteCollectionAttribute(attributeId).pipe(
            tapResponse(
              () => this._reload.next(null),
              (error) => this._error.next(error)
            )
          )
        )
      )
  );

  reload() {
    this._reload.next(null);
  }
}
