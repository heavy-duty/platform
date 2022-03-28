import { Injectable } from '@angular/core';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import {
  WorkspaceApiService,
  WorkspaceInstructionsStore,
  WorkspaceStore,
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

@Injectable()
export class MyWorkspaceListStore extends ComponentStore<object> {
  constructor(
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore,
    private readonly _workspaceStore: WorkspaceStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore,
    configStore: ConfigStore
  ) {
    super({});

    this._handleInstruction(
      configStore.workspaceId$.pipe(
        isNotNullOrUndefined,
        switchMap((workspaceId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Workspace' && account.pubkey === workspaceId
              )
            )
          )
        )
      )
    );
  }

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'deleteWorkspace': {
          this._workspaceStore.dispatch(instructionStatus);
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
