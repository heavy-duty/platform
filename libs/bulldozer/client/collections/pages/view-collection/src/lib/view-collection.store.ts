import { Injectable } from '@angular/core';
import {
  CollectionApiService,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  InstructionStatus,
  WorkspaceInstructionsStore,
} from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
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
  collectionId: string | null;
  applicationId: string | null;
  workspaceId: string | null;
}

const initialState: ViewModel = {
  collectionId: null,
  applicationId: null,
  workspaceId: null,
};

@Injectable()
export class ViewCollectionStore extends ComponentStore<ViewModel> {
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _collectionApiService: CollectionApiService,
    private readonly _walletStore: WalletStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _tabStore: TabStore,
    private readonly _collectionStore: CollectionStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._openTab(
      this.select(
        this.collectionId$,
        this.applicationId$,
        this.workspaceId$,
        (collectionId, applicationId, workspaceId) => ({
          collectionId,
          applicationId,
          workspaceId,
        }),
        { debounce: true }
      )
    );
    this._handleInstruction(
      this.collectionId$.pipe(
        isNotNullOrUndefined,
        switchMap((collectionId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Collection' &&
                  account.pubkey === collectionId
              )
            )
          )
        )
      )
    );
    this._collectionStore.setCollectionId(this.collectionId$);
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  readonly setApplicationId = this.updater<string | null>(
    (state, applicationId) => ({ ...state, applicationId })
  );

  readonly setCollectionId = this.updater<string | null>(
    (state, collectionId) => ({ ...state, collectionId })
  );

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createCollection':
        case 'updateCollection':
        case 'deleteCollection': {
          this._collectionStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  private readonly _openTab = this.effect<{
    collectionId: string | null;
    applicationId: string | null;
    workspaceId: string | null;
  }>(
    tap(({ collectionId, applicationId, workspaceId }) => {
      if (
        collectionId !== null &&
        applicationId !== null &&
        workspaceId !== null
      ) {
        this._tabStore.openTab({
          id: collectionId,
          kind: 'collection',
          url: `/workspaces/${workspaceId}/applications/${applicationId}/collections/${collectionId}`,
        });
      }
    })
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
