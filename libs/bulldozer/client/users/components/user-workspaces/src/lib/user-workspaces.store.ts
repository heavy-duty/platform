import { Injectable } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  InstructionStatus,
  UserInstructionsStore,
} from '@bulldozer-client/users-data-access';
import {
  WorkspaceApiService,
  WorkspaceQueryStore,
  WorkspacesStore,
} from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  combineLatest,
  concatMap,
  EMPTY,
  map,
  of,
  pipe,
  tap,
  withLatestFrom,
} from 'rxjs';

@Injectable()
export class UserWorkspacesStore extends ComponentStore<object> {
  constructor(
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore,
    private readonly _workspacesStore: WorkspacesStore,
    private readonly _workspaceQueryStore: WorkspaceQueryStore,
    private readonly _userInstructionsStore: UserInstructionsStore,
    private readonly _workspaceApiService: WorkspaceApiService
  ) {
    super({});

    this._workspaceQueryStore.setFilters(
      combineLatest({
        authority: this._walletStore.publicKey$.pipe(
          isNotNullOrUndefined,
          map((publicKey) => publicKey.toBase58())
        ),
      })
    );
    this._workspacesStore.setWorkspaceIds(
      this._workspaceQueryStore.workspaceIds$
    );
    /* this._tabStore.openTab({
      id: 'profile',
      kind: 'profile',
      url: '/profile',
    }); */
    this._handleInstruction(this._userInstructionsStore.instruction$);
  }

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createWorkspace':
        case 'updateWorkspace':
        case 'deleteWorkspace': {
          this._workspacesStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  readonly deleteWorkspace = this.effect<string>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([workspaceId, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._workspaceApiService
          .delete({
            authority: authority.toBase58(),
            workspaceId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Delete workspace request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
