import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BudgetStore } from '@bulldozer-client/budgets-data-access';
import {
  CollaboratorsStore,
  CollaboratorStore,
} from '@bulldozer-client/collaborators-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { map } from 'rxjs';
import { ViewWorkspaceStore } from './view-workspace.store';

@Component({
  selector: 'bd-view-workspace',
  template: `
    <div
      *ngIf="workspace$ | ngrxPush as workspace"
      class="flex flex-col gap-5 p-5"
    >
      <header bdPageHeader>
        <h1>
          {{ workspace.name }}
        </h1>
        <p>Visualize all the details about this workspace.</p>
      </header>

      <main class="flex flex-col gap-4">
        <bd-budget-details
          *ngIf="budget$ | ngrxPush as budget"
          [budget]="budget"
          [minimumBalanceForRentExemption]="
            (budgetMinimumBalanceForRentExemption$ | ngrxPush) ?? null
          "
          (depositToBudget)="onDepositToBudget(budget.id, $event)"
        ></bd-budget-details>

        <bd-collaborators-list
          [showRejected]="(showRejectedCollaborators$ | ngrxPush) ?? false"
          [mode]="(collaboratorListMode$ | ngrxPush) ?? 'ready'"
          [currentUser]="(user$ | ngrxPush) ?? null"
          [currentCollaborator]="(collaborator$ | ngrxPush) ?? null"
          [readyCollaborators]="(readyCollaborators$ | ngrxPush) ?? null"
          [pendingCollaborators]="(pendingCollaborators$ | ngrxPush) ?? null"
          (approveCollaboratorStatusRequest)="
            onApproveCollaboratorStatusRequest($event)
          "
          (grantCollaboratorStatus)="onGrantCollaboratorStatus($event)"
          (rejectCollaboratorStatusRequest)="
            onRejectCollaboratorStatusRequest($event)
          "
          (requestCollaboratorStatus)="
            onRequestCollaboratorStatus(workspace.id)
          "
          (revokeCollaboratorStatus)="onRevokeCollaboratorStatus($event)"
          (retryCollaboratorStatusRequest)="
            onRetryCollaboratorStatusRequest($event)
          "
          (setCollaboratorListMode)="onSetCollaboratorListMode($event)"
          (toggleShowRejected)="onToggleShowRejectedCollaborators()"
        ></bd-collaborators-list>
      </main>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkspaceStore,
    ViewWorkspaceStore,
    CollaboratorsStore,
    CollaboratorStore,
    BudgetStore,
  ],
})
export class ViewWorkspaceComponent {
  readonly workspace$ = this._workspaceStore.workspace$;
  readonly readyCollaborators$ = this._viewWorkspaceStore.readyCollaborators$;
  readonly pendingCollaborators$ =
    this._viewWorkspaceStore.pendingCollaborators$;
  readonly collaboratorListMode$ =
    this._viewWorkspaceStore.collaboratorListMode$;
  readonly showRejectedCollaborators$ =
    this._viewWorkspaceStore.showRejectedCollaborators$;
  readonly budget$ = this._budgetStore.budget$;
  readonly user$ = this._userStore.user$;
  readonly collaborator$ = this._collaboratorStore.collaborator$;
  readonly budgetMinimumBalanceForRentExemption$ =
    this._viewWorkspaceStore.budgetMinimumBalanceForRentExemption$;

  constructor(
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _viewWorkspaceStore: ViewWorkspaceStore,
    private readonly _collaboratorsStore: CollaboratorsStore,
    private readonly _collaboratorStore: CollaboratorStore,
    private readonly _userStore: UserStore,
    private readonly _budgetStore: BudgetStore
  ) {
    this._collaboratorStore.setWorkspaceId(
      this._viewWorkspaceStore.workspaceId$
    );
    this._collaboratorStore.setUserId(this._userStore.userId$);
    this._collaboratorsStore.setFilters(
      this._viewWorkspaceStore.workspaceId$.pipe(
        isNotNullOrUndefined,
        map((workspaceId) => ({ workspace: workspaceId }))
      )
    );
    this._workspaceStore.setWorkspaceId(this._viewWorkspaceStore.workspaceId$);
    this._budgetStore.setWorkspaceId(this._viewWorkspaceStore.workspaceId$);
  }

  onDepositToBudget(budgetId: string, lamports: number) {
    this._budgetStore.depositToBudget({
      budgetId,
      lamports,
    });
  }

  onRequestCollaboratorStatus(workspaceId: string) {
    this._viewWorkspaceStore.requestCollaboratorStatus({
      workspaceId,
    });
  }

  onRetryCollaboratorStatusRequest(collaboratorId: string) {
    this._viewWorkspaceStore.retryCollaboratorStatusRequest({
      collaboratorId,
    });
  }

  onApproveCollaboratorStatusRequest(collaboratorId: string) {
    this._viewWorkspaceStore.updateCollaborator({
      collaboratorId,
      status: 1,
    });
  }

  onGrantCollaboratorStatus(collaboratorId: string) {
    this._viewWorkspaceStore.updateCollaborator({
      collaboratorId,
      status: 1,
    });
  }

  onRejectCollaboratorStatusRequest(collaboratorId: string) {
    this._viewWorkspaceStore.updateCollaborator({
      collaboratorId,
      status: 2,
    });
  }

  onRevokeCollaboratorStatus(collaboratorId: string) {
    this._viewWorkspaceStore.updateCollaborator({
      collaboratorId,
      status: 2,
    });
  }

  onSetCollaboratorListMode(mode: 'ready' | 'pending') {
    this._viewWorkspaceStore.setCollaboratorListMode(mode);
  }

  onToggleShowRejectedCollaborators() {
    this._viewWorkspaceStore.toggleShowRejectedCollaborators();
  }
}
