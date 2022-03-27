import { Injectable } from '@angular/core';
import {
  BudgetApiService,
  BudgetStore,
} from '@bulldozer-client/budgets-data-access';
import {
  CollaboratorApiService,
  CollaboratorsStore,
  CollaboratorStore,
} from '@bulldozer-client/collaborators-data-access';
import { ConfigStore, TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  InstructionStatus,
  UserStore,
} from '@bulldozer-client/users-data-access';
import {
  WorkspaceInstructionsStore,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { HdBroadcasterStore } from '@heavy-duty/broadcaster';
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
    private readonly _notificationStore: NotificationStore,
    private readonly _budgetApiService: BudgetApiService,
    private readonly _hdBroadcasterStore: HdBroadcasterStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _collaboratorsStore: CollaboratorsStore,
    private readonly _collaboratorStore: CollaboratorStore,
    private readonly _configStore: ConfigStore,
    private readonly _userStore: UserStore,
    private readonly _budgetStore: BudgetStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._workspaceStore.setWorkspaceId(this.workspaceId$);
    this._collaboratorStore.setWorkspaceId(this.workspaceId$);
    this._collaboratorStore.setUserId(this._userStore.userId$);
    this._collaboratorsStore.setFilters(
      combineLatest({
        workspace: this.workspaceId$.pipe(isNotNullOrUndefined),
      })
    );
    this._budgetStore.setWorkspaceId(this.workspaceId$);
    this._loadBudgetMinimumBalanceForRentExemption();
    this._openTab(this.workspaceId$);
    this._activateWorkspace(this.workspaceId$);
    this._handleInstruction(
      this.workspaceId$.pipe(
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

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
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

  private readonly _activateWorkspace = this.effect<string | null>(
    tap((workspaceId) => this._configStore.setWorkspaceId(workspaceId))
  );

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createWorkspace':
        case 'updateWorkspace':
        case 'deleteWorkspace': {
          this._workspaceStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
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
    workspaceId: string;
    status: number;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, collaboratorId, status }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .update({
            authority: authority.toBase58(),
            workspaceId,
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
    workspaceId: string;
    collaboratorId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, collaboratorId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._collaboratorApiService
          .retryCollaboratorStatusRequest({
            authority: authority.toBase58(),
            workspaceId,
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
