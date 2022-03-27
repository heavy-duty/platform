import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  EMPTY,
  map,
  switchMap,
} from 'rxjs';
import { CollectionApiService } from './collection-api.service';
import { ItemView } from './types';

export type CollectionView = ItemView<Document<Collection>>;

interface ViewModel {
  collectionId: string | null;
  collection: CollectionView | null;
  loading: boolean;
}

const initialState: ViewModel = {
  collectionId: null,
  collection: null,
  loading: false,
};

@Injectable()
export class CollectionStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  private readonly reload$ = this._reload.asObservable();
  readonly collection$ = this.select(({ collection }) => collection);
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly loading$ = this.select(({ loading }) => loading);

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadCollection(
      combineLatest([this.collectionId$, this.reload$]).pipe(
        map(([collectionId]) => collectionId)
      )
    );
  }

  readonly setCollectionId = this.updater<string | null>(
    (state, collectionId) => ({
      ...state,
      collectionId,
    })
  );

  private readonly _patchStatus = this.updater<{
    isCreating?: boolean;
    isUpdating?: boolean;
    isDeleting?: boolean;
  }>((state, statuses) => ({
    ...state,
    collection: state.collection
      ? {
          ...state.collection,
          ...statuses,
        }
      : null,
  }));

  private readonly _setCollection = this.updater<CollectionView | null>(
    (state, collection) => ({
      ...state,
      collection,
    })
  );

  private readonly _loadCollection = this.effect<string | null>(
    switchMap((collectionId) => {
      if (collectionId === null) {
        this.patchState({ collection: null });
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._collectionApiService.findById(collectionId).pipe(
        tapResponse(
          (collection) => {
            if (collection !== null) {
              this._setCollection({
                document: collection,
                isCreating: false,
                isUpdating: false,
                isDeleting: false,
              });
            }
            this.patchState({ loading: false });
          },
          (error) => this._notificationStore.setError({ error, loading: false })
        )
      );
    })
  );

  readonly dispatch = this.effect<InstructionStatus>(
    concatMap((instructionStatus) => {
      const collectionAccountMeta = instructionStatus.accounts.find(
        (account) => account.name === 'Collection'
      );

      if (collectionAccountMeta === undefined) {
        return EMPTY;
      }

      switch (instructionStatus.name) {
        case 'createCollection': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({ isCreating: false });
            return EMPTY;
          }

          return this._collectionApiService
            .findById(collectionAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (collection) => {
                  if (collection !== null) {
                    this._setCollection({
                      document: collection,
                      isCreating: true,
                      isUpdating: false,
                      isDeleting: false,
                    });
                  }
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateCollection': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({ isUpdating: false });
            return EMPTY;
          }

          return this._collectionApiService
            .findById(collectionAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (collection) => {
                  if (collection !== null) {
                    this._setCollection({
                      document: collection,
                      isCreating: false,
                      isUpdating: true,
                      isDeleting: false,
                    });
                  }
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteCollection': {
          if (instructionStatus.status === 'confirmed') {
            this._patchStatus({ isDeleting: true });
          } else {
            this.patchState({ collection: null });
            this._patchStatus({ isDeleting: false });
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );

  reload() {
    this._reload.next(null);
  }
}
