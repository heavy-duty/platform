import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditAttributeComponent } from '@heavy-duty/bulldozer/application/features/edit-attribute';
import { EditCollectionComponent } from '@heavy-duty/bulldozer/application/features/edit-collection';
import { generateCollectionCode } from '@heavy-duty/bulldozer/application/utils/services/code-generator';
import {
  CollectionAttribute,
  CollectionExtended,
} from '@heavy-duty/bulldozer/application/utils/types';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { sendAndConfirmRawTransaction } from '@solana/web3.js';
import {
  BehaviorSubject,
  combineLatest,
  defer,
  from,
  Observable,
  Subject,
  throwError,
} from 'rxjs';
import {
  concatMap,
  exhaustMap,
  filter,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  CollectionActions,
  CollectionAttributeCreated,
  CollectionAttributeDeleted,
  CollectionAttributeUpdated,
  CollectionCreated,
  CollectionDeleted,
  CollectionInit,
  CollectionUpdated,
} from './actions/collection.actions';
import { ApplicationStore } from './application.store';
import { WorkspaceStore } from './workspace.store';

interface ViewModel {
  collectionId: string | null;
  collections: CollectionExtended[];
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
  private readonly _events = new BehaviorSubject<CollectionActions>(
    new CollectionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly collections$ = this.select(({ collections }) => collections);
  readonly activeCollections$ = this.select(
    this.collections$,
    this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
    (collections, applicationId) =>
      collections.filter(
        (collection) => collection.data.application === applicationId
      )
  );
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
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);
  }

  readonly loadCollections = this.effect(() =>
    combineLatest([
      this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([workspaceId]) =>
        this._bulldozerProgramStore.getExtendedCollections(workspaceId).pipe(
          tapResponse(
            (collections) => this.patchState({ collections }),
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
            filter((data) => data),
            withLatestFrom(
              this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name }, workspaceId, applicationId]) =>
              this._bulldozerProgramStore
                .createCollection(workspaceId, applicationId, name)
                .pipe(
                  tapResponse(
                    () => {
                      this._reload.next(null);
                      this._events.next(new CollectionCreated());
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
    (collection$: Observable<CollectionExtended>) =>
      collection$.pipe(
        exhaustMap((collection) =>
          this._matDialog
            .open(EditCollectionComponent, { data: { collection } })
            .afterClosed()
            .pipe(
              concatMap(({ name }) =>
                this._bulldozerProgramStore
                  .updateCollection(collection.id, name)
                  .pipe(
                    tapResponse(
                      () =>
                        this._events.next(new CollectionUpdated(collection.id)),
                      (error) => this._error.next(error)
                    )
                  )
              )
            )
        )
      )
  );

  readonly deleteCollection = this.effect(
    (collection$: Observable<CollectionExtended>) =>
      combineLatest([
        this._connectionStore.connection$.pipe(isNotNullOrUndefined),
        this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
        collection$,
      ]).pipe(
        concatMap(([connection, walletPublicKey, collection]) =>
          this._bulldozerProgramStore
            .getDeleteCollectionTransactions(
              connection,
              walletPublicKey,
              collection
            )
            .pipe(
              concatMap((transactions) => {
                const signAllTransactions$ =
                  this._walletStore.signAllTransactions(transactions);

                if (!signAllTransactions$) {
                  return throwError(
                    new Error('Sign all transactions method is not defined')
                  );
                }

                return signAllTransactions$;
              }),
              concatMap((transactions) =>
                from(
                  defer(() =>
                    Promise.all(
                      transactions.map((transaction) =>
                        sendAndConfirmRawTransaction(
                          connection,
                          transaction.serialize()
                        )
                      )
                    )
                  )
                )
              ),
              tapResponse(
                () => this._events.next(new CollectionDeleted(collection.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly createCollectionAttribute = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditAttributeComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
              this._applicationStore.applicationId$.pipe(isNotNullOrUndefined),
              this.collectionId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(
              ([
                collectionAttributeDto,
                workspaceId,
                applicationId,
                collectionId,
              ]) =>
                this._bulldozerProgramStore
                  .createCollectionAttribute(
                    workspaceId,
                    applicationId,
                    collectionId,
                    collectionAttributeDto
                  )
                  .pipe(
                    tapResponse(
                      () => this._events.next(new CollectionAttributeCreated()),
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
              concatMap((collectionAttributeDto) =>
                this._bulldozerProgramStore
                  .updateCollectionAttribute(
                    attribute.id,
                    collectionAttributeDto
                  )
                  .pipe(
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
    this._reload.next(null);
  }
}
