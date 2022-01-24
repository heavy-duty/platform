import { Injectable } from '@angular/core';
import {
  Collection,
  createCreateCollectionTransaction,
  createDeleteCollectionTransaction,
  createUpdateCollectionTransaction,
  Document,
  fromCollectionChange,
  fromCollectionCreated,
  getCollections,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  catchError,
  combineLatest,
  concatMap,
  EMPTY,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ConnectionStore } from './connection-store';

interface ViewModel {
  collectionsMap: Map<string, Document<Collection>>;
}

const initialState: ViewModel = {
  collectionsMap: new Map<string, Document<Collection>>(),
};

@Injectable()
export class CollectionStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  readonly collectionsMap$ = this.select(
    ({ collectionsMap }) => collectionsMap
  );
  readonly collections$ = this.select(this.collectionsMap$, (collectionsMap) =>
    Array.from(collectionsMap, ([, collection]) => collection)
  );

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
    super(initialState);
  }

  private readonly _setCollection = this.updater(
    (state, newCollection: Document<Collection>) => {
      const collectionsMap = new Map(state.collectionsMap);
      collectionsMap.set(newCollection.id, newCollection);
      return {
        ...state,
        collectionsMap,
      };
    }
  );

  private readonly _addCollection = this.updater(
    (state, newCollection: Document<Collection>) => {
      if (state.collectionsMap.has(newCollection.id)) {
        return state;
      }
      const collectionsMap = new Map(state.collectionsMap);
      collectionsMap.set(newCollection.id, newCollection);
      return {
        ...state,
        collectionsMap,
      };
    }
  );

  private readonly _removeCollection = this.updater(
    (state, collectionId: string) => {
      const collectionsMap = new Map(state.collectionsMap);
      collectionsMap.delete(collectionId);
      return {
        ...state,
        collectionsMap,
      };
    }
  );

  readonly onCollectionChanges = this.effect(() =>
    combineLatest([this._connectionStore.connection$, this.collections$]).pipe(
      switchMap(([connection, collections]) => {
        if (!connection) {
          return of(null);
        }

        return merge(
          ...collections.map((collection) =>
            fromCollectionChange(connection, new PublicKey(collection.id)).pipe(
              tap((changes) => {
                if (!changes) {
                  this._removeCollection(collection.id);
                } else {
                  this._setCollection(changes);
                }
              })
            )
          )
        );
      })
    )
  );

  readonly onCollectionCreated = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
      this.collections$,
    ]).pipe(
      switchMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return EMPTY;
        }

        return fromCollectionCreated(connection, {
          workspace: workspaceId,
        }).pipe(tap((collection) => this._addCollection(collection)));
      })
    )
  );

  readonly loadCollections = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
    ]).pipe(
      concatMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return of([]);
        }

        return getCollections(connection, {
          workspace: workspaceId,
        }).pipe(
          catchError((error) => {
            console.error(error);
            return EMPTY;
          })
        );
      }),
      tap((collections) =>
        this.patchState({
          collectionsMap: collections.reduce(
            (collectionsMap, collection) =>
              collectionsMap.set(collection.id, collection),
            new Map<string, Document<Collection>>()
          ),
        })
      )
    )
  );

  readonly createCollection = this.effect(
    (request$: Observable<{ collectionName: string; applicationId: string }>) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        this._bulldozerProgramStore.workspaceId$,
        request$,
      ]).pipe(
        concatMap(
          ([
            connection,
            authority,
            workspaceId,
            { collectionName, applicationId },
          ]) => {
            if (!connection || !authority || !workspaceId) {
              return of(null);
            }

            const collectionKeypair = new Keypair();

            return createCreateCollectionTransaction(
              connection,
              authority,
              new PublicKey(workspaceId),
              new PublicKey(applicationId),
              collectionKeypair,
              collectionName
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              )
            );
          }
        )
      )
  );

  readonly updateCollection = this.effect(
    (request$: Observable<{ collectionId: string; collectionName: string }>) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([connection, authority, { collectionId, collectionName }]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createUpdateCollectionTransaction(
              connection,
              authority,
              new PublicKey(collectionId),
              collectionName
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              )
            );
          }
        )
      )
  );

  readonly deleteCollection = this.effect(
    (request$: Observable<{ collectionId: string; applicationId: string }>) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([connection, authority, { collectionId, applicationId }]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createDeleteCollectionTransaction(
              connection,
              authority,
              new PublicKey(applicationId),
              new PublicKey(collectionId)
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              )
            );
          }
        )
      )
  );
}
