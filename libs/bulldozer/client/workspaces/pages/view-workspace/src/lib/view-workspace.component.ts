import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
        <h1 class="flex items-center justify-start gap-2">
          <span
            [matTooltip]="
              workspace.document.name
                | bdItemUpdatingMessage: workspace:'Workspace'
            "
            matTooltipShowDelay="500"
          >
            {{ workspace.document.name }}
          </span>
          <mat-progress-spinner
            *ngIf="workspace | bdItemShowSpinner"
            diameter="16"
            mode="indeterminate"
          ></mat-progress-spinner>
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
            onUpdateCollaborator(workspace.document.id, $event, 1)
          "
          (grantCollaboratorStatus)="
            onUpdateCollaborator(workspace.document.id, $event, 1)
          "
          (rejectCollaboratorStatusRequest)="
            onUpdateCollaborator(workspace.document.id, $event, 2)
          "
          (requestCollaboratorStatus)="
            onRequestCollaboratorStatus(workspace.document.id)
          "
          (revokeCollaboratorStatus)="
            onUpdateCollaborator(workspace.document.id, $event, 2)
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
export class ViewWorkspaceComponent implements OnInit {
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
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore,
    private readonly _route: ActivatedRoute
  ) {}

  ngOnInit() {
    this._viewWorkspaceStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
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

  onRetryCollaboratorStatusRequest(
    workspaceId: string,
    collaboratorId: string
  ) {
    this._viewWorkspaceStore.retryCollaboratorStatusRequest({
      workspaceId,
      collaboratorId,
    });
  }

  onUpdateCollaborator(
    workspaceId: string,
    collaboratorId: string,
    status: number
  ) {
    this._viewWorkspaceStore.updateCollaborator({
      workspaceId,
      collaboratorId,
      status,
    });
  }

  onSetCollaboratorListMode(mode: 'ready' | 'pending') {
    this._viewWorkspaceStore.setCollaboratorListMode(mode);
  }

  onToggleShowRejectedCollaborators() {
    this._viewWorkspaceStore.toggleShowRejectedCollaborators();
  }
}
