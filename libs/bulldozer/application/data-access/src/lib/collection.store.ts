import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditAttributeComponent } from '@heavy-duty/bulldozer/application/features/edit-attribute';
import { EditCollectionComponent } from '@heavy-duty/bulldozer/application/features/edit-collection';
import {
  Collection,
  CollectionAttribute,
} from '@heavy-duty/bulldozer/application/utils/types';
import { ProgramStore } from '@heavy-duty/bulldozer/data-access';
import { generateCollectionCode } from '@heavy-duty/bulldozer/application/utils/services/code-generator';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  combineLatest,
  from,
  Observable,
  of,
  Subject,
} from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  map,
  switchMap,
  tap,
  toArray,
  withLatestFrom,
} from 'rxjs/operators';

import { ApplicationStore } from './application.store';

export interface CollectionExtension {
  attributes: CollectionAttribute[];
}

interface ViewModel {
  collectionId: string | null;
  collections: (Collection & CollectionExtension)[];
}

const initialState: ViewModel = {
  collectionId: null,
  collections: [],
};

@Injectable()
export class CollectionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  readonly collections$ = this.select(({ collections }) => collections);
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly collection$ = this.select(
    this.collections$,
    this.collectionId$,
    (collections, collectionId) =>
      collections.find(({ id }) => id === collectionId) || null
  );
  readonly attributes$ = this.select(
    this.collection$,
    (collection) => collection && collection.attributes
  );
  readonly rustCode$ = this.select(
    this.collection$,
    (collection) => collection && generateCollectionCode(collection)
  );

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _matSnackBar: MatSnackBar,
    private readonly _programStore: ProgramStore,
    private readonly _applicationStore: ApplicationStore
  ) {
    super(initialState);
  }

  readonly loadCollections = this.effect(() =>
    combineLatest([
      this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([applicationId]) =>
        this._programStore.getCollections(applicationId)
      ),
      switchMap((collections) =>
        from(collections).pipe(
          switchMap((collection) =>
            this._programStore.getCollectionAttributes(collection.id).pipe(
              map((attributes) => ({
                ...collection,
                attributes,
              }))
            )
          ),
          toArray()
        )
      ),
      tapResponse(
        (collections) => this.patchState({ collections }),
        (error) => this._error.next(error)
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
            filter((data) => data),
            withLatestFrom(
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name }, applicationId]) =>
              this._programStore.createCollection(applicationId, name).pipe(
                tapResponse(
                  () => {
                    this._reload.next(null);
                    this._matSnackBar.open('Collection created', 'Close', {
                      panelClass: 'success-snackbar',
                      duration: 3000,
                    });
                  },
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
                    () => {
                      this._reload.next(null);
                      this._matSnackBar.open('Collection updated', 'Close', {
                        panelClass: 'success-snackbar',
                        duration: 3000,
                      });
                    },
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
            () => {
              this._reload.next(null);
              this._matSnackBar.open('Collection deleted', 'Close', {
                panelClass: 'success-snackbar',
                duration: 3000,
              });
            },
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
                    () => {
                      this._reload.next(null);
                      this._matSnackBar.open('Attribute created', 'Close', {
                        panelClass: 'success-snackbar',
                        duration: 3000,
                      });
                    },
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
                      () => {
                        this._reload.next(null);
                        this._matSnackBar.open('Attribute updated', 'Close', {
                          panelClass: 'success-snackbar',
                          duration: 3000,
                        });
                      },
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
              () => {
                this._reload.next(null);
                this._matSnackBar.open('Attribute deleted', 'Close', {
                  panelClass: 'success-snackbar',
                  duration: 3000,
                });
              },
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
