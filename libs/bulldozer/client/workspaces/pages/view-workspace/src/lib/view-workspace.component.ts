import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BudgetStore } from '@bulldozer-client/budgets-data-access';
import {
  CollaboratorsStore,
  CollaboratorStore,
} from '@bulldozer-client/collaborators-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceInstructionsStore,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
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
          <span
            [matTooltip]="
              workspace.document.name
                | bdItemUpdatingMessage: workspace:'Workspace'
            "
            class="flex items-center justify-start gap-2"
          >
            {{ workspace.document.name }}
            <mat-progress-spinner
              *ngIf="workspace | bdItemShowSpinner"
              diameter="16"
              mode="indeterminate"
            ></mat-progress-spinner>
          </span>
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
            onApproveCollaboratorStatusRequest(workspace.document.id, $event)
          "
          (grantCollaboratorStatus)="
            onGrantCollaboratorStatus(workspace.document.id, $event)
          "
          (rejectCollaboratorStatusRequest)="
            onRejectCollaboratorStatusRequest(workspace.document.id, $event)
          "
          (requestCollaboratorStatus)="
            onRequestCollaboratorStatus(workspace.document.id)
          "
          (revokeCollaboratorStatus)="
            onRevokeCollaboratorStatus(workspace.document.id, $event)
          "
          (retryCollaboratorStatusRequest)="
            onRetryCollaboratorStatusRequest(workspace.document.id, $event)
          "
          (setCollaboratorListMode)="onSetCollaboratorListMode($event)"
          (toggleShowRejected)="onToggleShowRejectedCollaborators()"
        ></bd-collaborators-list>

        <bd-workspace-instructions
          [instructionStatuses]="(instructionStatuses$ | ngrxPush) ?? null"
        ></bd-workspace-instructions>
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
  readonly instructionStatuses$ =
    this._workspaceInstructionsStore.instructionStatuses$;

  constructor(
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _viewWorkspaceStore: ViewWorkspaceStore,
    private readonly _collaboratorStore: CollaboratorStore,
    private readonly _userStore: UserStore,
    private readonly _budgetStore: BudgetStore,
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {}

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

  onRetryCollaboratorStatusRequest(
    workspaceId: string,
    collaboratorId: string
  ) {
    this._viewWorkspaceStore.retryCollaboratorStatusRequest({
      workspaceId,
      collaboratorId,
    });
  }

  onApproveCollaboratorStatusRequest(
    workspaceId: string,
    collaboratorId: string
  ) {
    this._viewWorkspaceStore.updateCollaborator({
      workspaceId,
      collaboratorId,
      status: 1,
    });
  }

  onGrantCollaboratorStatus(workspaceId: string, collaboratorId: string) {
    this._viewWorkspaceStore.updateCollaborator({
      workspaceId,
      collaboratorId,
      status: 1,
    });
  }

  onRejectCollaboratorStatusRequest(
    workspaceId: string,
    collaboratorId: string
  ) {
    this._viewWorkspaceStore.updateCollaborator({
      workspaceId,
      collaboratorId,
      status: 2,
    });
  }

  onRevokeCollaboratorStatus(workspaceId: string, collaboratorId: string) {
    this._viewWorkspaceStore.updateCollaborator({
      workspaceId,
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
