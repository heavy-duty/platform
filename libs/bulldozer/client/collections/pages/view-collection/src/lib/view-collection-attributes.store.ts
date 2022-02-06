import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollectionAttributeApiService,
  CollectionAttributeSocketService,
} from '@bulldozer-client/collections-data-access';
import {
  CollectionAttribute,
  CollectionAttributeDto,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  first,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  loading: boolean;
  collectionAttributesMap: Map<string, Document<CollectionAttribute>>;
  error: unknown | null;
}

const initialState: ViewModel = {
  loading: false,
  collectionAttributesMap: new Map<string, Document<CollectionAttribute>>(),
  error: null,
};

@Injectable()
export class ViewCollectionAttributesStore extends ComponentStore<ViewModel> {
  readonly error$ = this.select(({ error }) => error);
  readonly loading$ = this.select(({ loading }) => loading);
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
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _collectionAttributeSocketService: CollectionAttributeSocketService,
    private readonly _walletStore: WalletStore,
    private readonly _route: ActivatedRoute
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

  private readonly _handleCollectionAttributeChanges = this.effect(
    (collectionAttributeId$: Observable<string>) =>
      collectionAttributeId$.pipe(
        mergeMap((collectionAttributeId) =>
          this._collectionAttributeSocketService
            .collectionAttributeChanges(collectionAttributeId)
            .pipe(
              tapResponse(
                (changes) => {
                  if (changes === null) {
                    this._removeCollectionAttribute(collectionAttributeId);
                  } else {
                    this._setCollectionAttribute(changes);
                  }
                },
                (error) => this._setError(error)
              ),
              takeUntil(
                this.loading$.pipe(
                  filter((loading) => loading),
                  first()
                )
              ),
              takeWhile((collection) => collection !== null)
            )
        )
      )
  );

  protected readonly handleCollectionAttributeCreated = this.effect(() =>
    this._route.paramMap.pipe(
      map((paramMap) => paramMap.get('collectionId')),
      switchMap((collectionId) => {
        if (collectionId === null) {
          return of(null);
        }

        return this._collectionAttributeSocketService
          .collectionAttributeCreated({
            collection: collectionId,
          })
          .pipe(
            tapResponse(
              (collectionAttribute) => {
                this._addCollectionAttribute(collectionAttribute);
                this._handleCollectionAttributeChanges(collectionAttribute.id);
              },
              (error) => this._setError(error)
            )
          );
      })
    )
  );

  protected readonly loadCollectionAttributes = this.effect(() =>
    this._route.paramMap.pipe(
      map((paramMap) => paramMap.get('collectionId')),
      tap(() => this.patchState({ loading: true })),
      switchMap((collectionId) => {
        if (collectionId === null) {
          return of([]);
        }

        return this._collectionAttributeApiService.find({
          collection: collectionId,
        });
      }),
      tapResponse(
        (collectionAttributes) => {
          this.patchState({
            collectionAttributesMap: collectionAttributes.reduce(
              (collectionAttributesMap, collectionAttribute) =>
                collectionAttributesMap.set(
                  collectionAttribute.id,
                  collectionAttribute
                ),
              new Map<string, Document<CollectionAttribute>>()
            ),
            loading: false,
          });
          collectionAttributes.forEach(({ id }) =>
            this._handleCollectionAttributeChanges(id)
          );
        },
        (error) => this._setError(error)
      )
    )
  );

  readonly createCollectionAttribute = this.effect(
    (
      $: Observable<{
        collectionAttributeDto: CollectionAttributeDto;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this._route.paramMap.pipe(
                map((paramMap) => paramMap.get('workspaceId'))
              ),
              this._route.paramMap.pipe(
                map((paramMap) => paramMap.get('applicationId'))
              ),
              this._route.paramMap.pipe(
                map((paramMap) => paramMap.get('collectionId'))
              ),
              this._walletStore.publicKey$
            )
          )
        ),
        concatMap(
          ([
            { collectionAttributeDto },
            workspaceId,
            applicationId,
            collectionId,
            authority,
          ]) => {
            if (
              workspaceId === null ||
              applicationId === null ||
              collectionId === null ||
              authority === null
            ) {
              return EMPTY;
            }

            return this._collectionAttributeApiService.create({
              collectionAttributeDto,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              collectionId,
            });
          }
        )
      )
  );

  readonly updateCollectionAttribute = this.effect(
    (
      $: Observable<{
        collectionAttributeId: string;
        collectionAttributeDto: CollectionAttributeDto;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(
          ([{ collectionAttributeId, collectionAttributeDto }, authority]) => {
            if (authority === null) {
              return EMPTY;
            }

            return this._collectionAttributeApiService.update({
              collectionAttributeDto,
              authority: authority?.toBase58(),
              collectionAttributeId,
            });
          }
        )
      )
  );

  readonly deleteCollectionAttribute = this.effect(
    ($: Observable<{ collectionAttributeId: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(
              this._route.paramMap.pipe(
                map((paramMap) => paramMap.get('collectionId'))
              ),
              this._walletStore.publicKey$
            )
          )
        ),
        concatMap(([{ collectionAttributeId }, collectionId, authority]) => {
          if (collectionId === null || authority === null) {
            return EMPTY;
          }

          return this._collectionAttributeApiService.delete({
            authority: authority.toBase58(),
            collectionAttributeId,
            collectionId,
          });
        })
      )
  );
}
