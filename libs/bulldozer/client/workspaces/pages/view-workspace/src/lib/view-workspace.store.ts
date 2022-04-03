import { Injectable } from '@angular/core';
import { ConfigStore, TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  WorkspaceApiService,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, of, pipe, tap, withLatestFrom } from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
}

const initialState: ViewModel = {
  workspaceId: null,
};

@Injectable()
export class ViewWorkspaceStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _configStore: ConfigStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _walletStore: WalletStore,
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _workspaceStore: WorkspaceStore
  ) {
    super(initialState);

    this._workspaceStore.setWorkspaceId(this.workspaceId$);
    this._openTab(this.workspaceId$);
    this._activateWorkspace(this.workspaceId$);
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  private readonly _activateWorkspace = this.effect<string | null>(
    tap((workspaceId) => this._configStore.setWorkspaceId(workspaceId))
  );

  private readonly _openTab = this.effect<string | null>(
    tap((workspaceId) => {
      if (workspaceId !== null) {
        this._tabStore.openTab({
          id: workspaceId,
          kind: 'workspace',
          url: `/workspaces/${workspaceId}`,
        });
      }
    })
  );

  readonly updateWorkspace = this.effect<{
    workspaceId: string;
    workspaceName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, workspaceName }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._workspaceApiService
          .update({
            workspaceName,
            authority: authority.toBase58(),
            workspaceId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Update workspace request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
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
