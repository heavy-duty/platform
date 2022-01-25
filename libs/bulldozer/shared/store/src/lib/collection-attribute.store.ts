import { Injectable } from '@angular/core';
import {
  CollectionAttribute,
  CollectionAttributeDto,
  createCreateCollectionAttributeTransaction,
  createDeleteCollectionAttributeTransaction,
  createUpdateCollectionAttributeTransaction,
  Document,
  fromCollectionAttributeChange,
  fromCollectionAttributeCreated,
  getCollectionAttributes,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  catchError,
  combineLatest,
  concatMap,
  EMPTY,
  merge,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { BulldozerProgramStore } from './bulldozer-program.store';
import { ConnectionStore } from './connection-store';

interface ViewModel {
  error?: unknown;
  collectionAttributesMap: Map<string, Document<CollectionAttribute>>;
}

const initialState: ViewModel = {
  collectionAttributesMap: new Map<string, Document<CollectionAttribute>>(),
};

@Injectable()
export class CollectionAttributeStore extends ComponentStore<ViewModel> {
  readonly error$ = this.select(({ error }) => error);
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

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
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

  private readonly _setError = this.updater((state, error: unknown) => ({
    ...state,
    error,
  }));

  readonly onCollectionAttributeChanges = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this.collectionAttributes$,
    ]).pipe(
      switchMap(([connection, collectionAttributes]) => {
        if (!connection) {
          return of(null);
        }

        return merge(
          ...collectionAttributes.map((collectionAttribute) =>
            fromCollectionAttributeChange(
              connection,
              new PublicKey(collectionAttribute.id)
            ).pipe(
              tapResponse(
                (changes) => {
                  if (!changes) {
                    this._removeCollectionAttribute(collectionAttribute.id);
                  } else {
                    this._setCollectionAttribute(changes);
                  }
                },
                (error) => this._setError(error)
              )
            )
          )
        );
      })
    )
  );

  readonly onCollectionAttributeCreated = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
      this.collectionAttributes$,
    ]).pipe(
      switchMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return EMPTY;
        }

        return fromCollectionAttributeCreated(connection, {
          workspace: workspaceId,
        }).pipe(
          tapResponse(
            (collectionAttribute) =>
              this._addCollectionAttribute(collectionAttribute),
            (error) => this._setError(error)
          )
        );
      })
    )
  );

  readonly loadCollectionAttributes = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
    ]).pipe(
      concatMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return of([]);
        }

        return getCollectionAttributes(connection, {
          workspace: workspaceId,
        });
      }),
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
        (error) => this._setError(error)
      )
    )
  );

  readonly createCollectionAttribute = this.effect(
    (
      request$: Observable<{
        collectionAttributeDto: CollectionAttributeDto;
        collectionId: string;
        applicationId: string;
      }>
    ) =>
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
            { collectionAttributeDto, collectionId, applicationId },
          ]) => {
            if (!connection || !authority || !workspaceId) {
              return of(null);
            }

            const collectionAttributeKeypair = new Keypair();

            return createCreateCollectionAttributeTransaction(
              connection,
              authority,
              new PublicKey(workspaceId),
              new PublicKey(applicationId),
              new PublicKey(collectionId),
              collectionAttributeKeypair,
              collectionAttributeDto
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              ),
              catchError((error) => {
                this._setError(error);
                return EMPTY;
              })
            );
          }
        )
      )
  );

  readonly updateCollectionAttribute = this.effect(
    (
      request$: Observable<{
        collectionAttributeId: string;
        collectionAttributeDto: CollectionAttributeDto;
      }>
    ) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([
            connection,
            authority,
            { collectionAttributeId, collectionAttributeDto },
          ]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createUpdateCollectionAttributeTransaction(
              connection,
              authority,
              new PublicKey(collectionAttributeId),
              collectionAttributeDto
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              ),
              catchError((error) => {
                this._setError(error);
                return EMPTY;
              })
            );
          }
        )
      )
  );

  readonly deleteCollectionAttribute = this.effect(
    (
      request$: Observable<{
        collectionAttributeId: string;
        collectionId: string;
      }>
    ) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([
            connection,
            authority,
            { collectionAttributeId, collectionId },
          ]) => {
            if (
              !connection ||
              !authority ||
              !collectionAttributeId ||
              !collectionId
            ) {
              return of(null);
            }

            return createDeleteCollectionAttributeTransaction(
              connection,
              authority,
              new PublicKey(collectionId),
              new PublicKey(collectionAttributeId)
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              ),
              catchError((error) => {
                this._setError(error);
                return EMPTY;
              })
            );
          }
        )
      )
  );
}
