import { Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BudgetApiService } from '@bulldozer-client/budgets-data-access';
import {
  CollaboratorApiService,
  CollaboratorsStore,
} from '@bulldozer-client/collaborators-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterStore } from '@heavy-duty/broadcaster';
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
  showRejectedCollaborators: boolean;
  collaboratorListMode: 'pending' | 'ready';
}

const initialState: ViewModel = {
  workspaceId: null,
  budgetMinimumBalanceForRentExemption: null,
  showRejectedCollaborators: false,
  collaboratorListMode: 'ready',
};

@Injectable()
export class ViewWorkspaceStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly showRejectedCollaborators$ = this.select(
    ({ showRejectedCollaborators }) => showRejectedCollaborators
  );
  readonly collaboratorListMode$ = this.select(
    ({ collaboratorListMode }) => collaboratorListMode
  );
  readonly budgetMinimumBalanceForRentExemption$ = this.select(
    ({ budgetMinimumBalanceForRentExemption }) =>
      budgetMinimumBalanceForRentExemption
  );
  readonly pendingCollaborators$ = this.select(
    this._collaboratorsStore.collaborators$,
    (collaborators) =>
      collaborators
        .filter((collaborator) => collaborator.data.status.id === 0)
        .sort((a, b) => a.createdAt.toNumber() - b.createdAt.toNumber())
  );
  readonly readyCollaborators$ = this.select(
    this._collaboratorsStore.collaborators$,
    this.showRejectedCollaborators$,
    (collaborators, showRejectedCollaborators) =>
      collaborators
        .filter(
          (collaborator) =>
            collaborator.data.status.id === 1 ||
            (collaborator.data.status.id === 2 && showRejectedCollaborators)
        )
        .sort((a, b) => a.createdAt.toNumber() - b.createdAt.toNumber())
  );
  readonly transactionStatuses$ = this.select(
    this.workspaceId$,
    this._hdBroadcasterStore.transactionStatuses$,
    (workspaceId, transactionStatuses) =>
      transactionStatuses.filter(
        (transactionStatus) => transactionStatus.topic === workspaceId
      )
  );

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _walletStore: WalletStore,
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _collaboratorsStore: CollaboratorsStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _budgetApiService: BudgetApiService,
    private readonly _hdBroadcasterStore: HdBroadcasterStore,
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

  readonly toggleShowRejectedCollaborators = this.updater((state) => ({
    ...state,
    showRejectedCollaborators: !state.showRejectedCollaborators,
  }));

  readonly setCollaboratorListMode = this.updater<'ready' | 'pending'>(
    (state, collaboratorListMode) => ({
      ...state,
      collaboratorListMode,
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
    collaboratorId: string;
    status: number;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ collaboratorId, status }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .update({
            authority: authority.toBase58(),
            status,
            collaboratorId,
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
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .requestCollaboratorStatus({
            authority: authority.toBase58(),
            workspaceId,
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

  readonly retryCollaboratorStatusRequest = this.effect<{
    collaboratorId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ collaboratorId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .retryCollaboratorStatusRequest({
            authority: authority.toBase58(),
            collaboratorId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Retry collaborator status request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
