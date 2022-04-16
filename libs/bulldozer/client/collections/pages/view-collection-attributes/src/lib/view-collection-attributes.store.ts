import { Injectable } from '@angular/core';
import {
  CollectionAttributeApiService,
  CollectionAttributeQueryStore,
  CollectionAttributesStore,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { CollectionAttributeDto } from '@heavy-duty/bulldozer-devkit';
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
export class ViewCollectionAttributesStore extends ComponentStore<ViewModel> {
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _collectionStore: CollectionStore,
    private readonly _collectionAttributesStore: CollectionAttributesStore,
    private readonly _collectionAttributeQueryStore: CollectionAttributeQueryStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._collectionAttributeQueryStore.setFilters(
      combineLatest({
        collection: this.collectionId$.pipe(isNotNullOrUndefined),
      })
    );
    this._collectionAttributesStore.setCollectionAttributeIds(
      this._collectionAttributeQueryStore.collectionAttributeIds$
    );

    this._handleInstruction(
      this.collectionId$.pipe(
        isNotNullOrUndefined,
        switchMap((collectionId) =>
          this._workspaceInstructionsStore.instruction$.pipe(
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
        /* case 'createCollection':
        case 'updateCollection':
        case 'deleteCollection': {
          this._collectionStore.dispatch(instructionStatus);
          break;
        } */
        case 'createCollectionAttribute':
        case 'updateCollectionAttribute':
        case 'deleteCollectionAttribute': {
          this._collectionAttributesStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  readonly createCollectionAttribute = this.effect<{
    workspaceId: string;
    applicationId: string;
    collectionId: string;
    collectionAttributeDto: CollectionAttributeDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, collectionId, collectionAttributeDto },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionAttributeApiService
            .create({
              collectionAttributeDto,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              collectionId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Create attribute request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly updateCollectionAttribute = this.effect<{
    workspaceId: string;
    collectionId: string;
    collectionAttributeId: string;
    collectionAttributeDto: CollectionAttributeDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          {
            workspaceId,
            collectionId,
            collectionAttributeId,
            collectionAttributeDto,
          },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionAttributeApiService
            .update({
              authority: authority.toBase58(),
              workspaceId,
              collectionId,
              collectionAttributeDto,
              collectionAttributeId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Update attribute request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly deleteCollectionAttribute = this.effect<{
    workspaceId: string;
    collectionId: string;
    collectionAttributeId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ workspaceId, collectionId, collectionAttributeId }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionAttributeApiService
            .delete({
              authority: authority.toBase58(),
              workspaceId,
              collectionAttributeId,
              collectionId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Delete attribute request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );
}
