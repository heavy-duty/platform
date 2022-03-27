import { Injectable } from '@angular/core';
import {
  CollectionApiService,
  CollectionQueryStore,
  CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  combineLatest,
  concatMap,
  EMPTY,
  filter,
  of,
  pipe,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  applicationId: string | null;
  workspaceId: string | null;
}

const initialState: ViewModel = {
  applicationId: null,
  workspaceId: null,
};

@Injectable()
export class CollectionExplorerStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionQueryStore: CollectionQueryStore,
    private readonly _collectionsStore: CollectionsStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._collectionQueryStore.setFilters(
      combineLatest({
        application: this.applicationId$.pipe(isNotNullOrUndefined),
      })
    );
    this._collectionsStore.setCollectionIds(
      this._collectionQueryStore.collectionIds$
    );
    this._handleInstruction(
      this.applicationId$.pipe(
        isNotNullOrUndefined,
        switchMap((applicationId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Application' &&
                  account.pubkey === applicationId
              )
            )
          )
        )
      )
    );
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  readonly setApplicationId = this.updater<string | null>(
    (state, applicationId) => ({ ...state, applicationId })
  );

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createCollection':
        case 'updateCollection':
        case 'deleteCollection': {
          this._collectionsStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  readonly createCollection = this.effect<{
    workspaceId: string;
    applicationId: string;
    collectionName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ collectionName, workspaceId, applicationId }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionApiService
            .create({
              collectionName,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Create collection request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly updateCollection = this.effect<{
    workspaceId: string;
    applicationId: string;
    collectionId: string;
    collectionName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, collectionId, collectionName },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionApiService
            .update({
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              collectionName,
              collectionId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Update collection request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly deleteCollection = this.effect<{
    workspaceId: string;
    applicationId: string;
    collectionId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, collectionId, applicationId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collectionApiService
          .delete({
            authority: authority.toBase58(),
            workspaceId,
            collectionId,
            applicationId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Delete collection request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
