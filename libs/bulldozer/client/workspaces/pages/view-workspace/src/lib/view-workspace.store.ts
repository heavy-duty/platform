import { Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BudgetApiService } from '@bulldozer-client/budgets-data-access';
import { CollaboratorApiService } from '@bulldozer-client/collaborators-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  of,
  pipe,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
  budgetMinimumBalanceForRentExemption: number | null;
}

const initialState: ViewModel = {
  workspaceId: null,
  budgetMinimumBalanceForRentExemption: null,
};

@Injectable()
export class ViewWorkspaceStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly budgetMinimumBalanceForRentExemption$ = this.select(
    ({ budgetMinimumBalanceForRentExemption }) =>
      budgetMinimumBalanceForRentExemption
  );

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _walletStore: WalletStore,
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _notificationStore: NotificationStore,
    private readonly _budgetApiService: BudgetApiService,
    route: ActivatedRoute
  ) {
    super(initialState);

    this._openTab(this.workspaceId$);
    this._setRouteParameters(route.paramMap);
    this._loadBudgetMinimumBalanceForRentExemption();
  }

  private readonly _setRouteParameters = this.updater<ParamMap>(
    (state, paramMap) => ({
      ...state,
      workspaceId: paramMap.get('workspaceId'),
    })
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

  private readonly _loadBudgetMinimumBalanceForRentExemption =
    this.effect<void>(
      switchMap(() =>
        this._budgetApiService.getMinimumBalanceForRentExemption().pipe(
          tapResponse(
            (budgetMinimumBalanceForRentExemption) =>
              this.patchState({ budgetMinimumBalanceForRentExemption }),
            (error) => this._notificationStore.setError(error)
          )
        )
      )
    );

  readonly updateCollaborator = this.effect<{
    workspaceId: string;
    userId: string;
    status: number;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, userId, status }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .update({
            authority: authority.toBase58(),
            workspaceId,
            status,
            userId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Update collaborator request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly requestCollaboratorStatus = this.effect<{
    workspaceId: string;
    userId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, userId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .requestCollaboratorStatus({
            authority: authority.toBase58(),
            workspaceId,
            userId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Request collaborator status request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
