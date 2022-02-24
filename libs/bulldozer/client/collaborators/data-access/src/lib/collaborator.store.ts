import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Collaborator,
  Document,
  findCollaboratorAddress,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { PublicKey } from '@solana/web3.js';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { CollaboratorApiService } from './collaborator-api.service';
import { CollaboratorEventService } from './collaborator-event.service';

interface ViewModel {
  loading: boolean;
  workspaceId: string | null;
  userId: string | null;
  collaboratorId: string | null;
  collaborator: Document<Collaborator> | null;
}

const initialState: ViewModel = {
  workspaceId: null,
  userId: null,
  collaboratorId: null,
  collaborator: null,
  loading: false,
};

@Injectable()
export class CollaboratorStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly collaborator$ = this.select(({ collaborator }) => collaborator);
  readonly collaboratorId$ = this.select(
    ({ collaboratorId }) => collaboratorId
  );
  readonly userId$ = this.select(({ userId }) => userId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _collaboratorEventService: CollaboratorEventService,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);

    this._loadCollaboratorId(
      this.select(this.workspaceId$, this.userId$, (workspaceId, userId) => ({
        workspaceId,
        userId,
      }))
    );
    this._loadCollaborator(this.collaboratorId$);
    this._handleCollaboratorCreated(this._walletStore.publicKey$);
    this._handleCollaboratorDeleted(this.collaboratorId$);
  }

  readonly setUserId = this.updater<string | null>((state, userId) => ({
    ...state,
    userId,
  }));

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  private readonly _handleCollaboratorDeleted = this.effect<string | null>(
    switchMap((collaboratorId) => {
      if (collaboratorId === null) {
        return EMPTY;
      }

      return this._collaboratorEventService
        .collaboratorDeleted(collaboratorId)
        .pipe(
          tapResponse(
            () => this.patchState({ collaborator: null }),
            (error) => this._notificationStore.setError(error)
          )
        );
    })
  );

  private readonly _handleCollaboratorCreated = this.effect<PublicKey | null>(
    switchMap((walletPublicKey) => {
      if (walletPublicKey === null) {
        return EMPTY;
      }

      return this._collaboratorEventService
        .collaboratorCreated({ authority: walletPublicKey.toBase58() })
        .pipe(
          tapResponse(
            (collaborator) => this.patchState({ collaborator }),
            (error) => this._notificationStore.setError(error)
          )
        );
    })
  );

  private readonly _loadCollaboratorId = this.effect<{
    userId: string | null;
    workspaceId: string | null;
  }>(
    concatMap(({ userId, workspaceId }) => {
      if (userId === null || workspaceId === null) {
        this.patchState({ collaboratorId: null });
        return EMPTY;
      }

      return findCollaboratorAddress(workspaceId, userId).pipe(
        tapResponse(
          ([collaboratorId]) => this.patchState({ collaboratorId }),
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  private readonly _loadCollaborator = this.effect<string | null>(
    switchMap((collaboratorId) => {
      if (collaboratorId === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._collaboratorApiService.findById(collaboratorId).pipe(
        tapResponse(
          (collaborator) => {
            this.patchState({
              collaborator,
              loading: false,
            });
          },
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );
}
