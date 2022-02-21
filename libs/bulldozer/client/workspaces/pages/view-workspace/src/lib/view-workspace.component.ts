import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { BudgetStore } from '@bulldozer-client/budgets-data-access';
import { CollaboratorsStore } from '@bulldozer-client/collaborators-data-access';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { map } from 'rxjs';
import { ViewWorkspaceStore } from './view-workspace.store';

@Component({
  selector: 'bd-view-workspace',
  template: `
    <ng-container *ngIf="workspace$ | ngrxPush as workspace">
      <header bdPageHeader>
        <h1>
          {{ workspace.name }}
        </h1>
        <p>Visualize all the details about this workspace.</p>
      </header>

      <main>
        <section *ngIf="budget$ | ngrxPush as budget">
          <h2>Budget</h2>

          <p>Total in Lamports: {{ budget.metadata.lamports }}</p>

          <button
            mat-raised-button
            color="primary"
            bdDepositToBudgetTrigger
            (depositToBudget)="onDepositToBudget(budget.id, $event)"
          >
            Deposit
          </button>
        </section>

        <section>
          <h2>Collaborators</h2>

          <div *ngFor="let collaborator of collaborators$ | ngrxPush">
            <h3>Collaborator ID: {{ collaborator.id }}</h3>
            <p>User ID: {{ collaborator.data.user }}</p>
            <p>Wallet: {{ collaborator.data.authority }}</p>
          </div>
        </section>
      </main>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkspaceStore,
    ViewWorkspaceStore,
    CollaboratorsStore,
    BudgetStore,
  ],
})
export class ViewWorkspaceComponent {
  @HostBinding('class') class = 'block p-4';
  readonly workspace$ = this._workspaceStore.workspace$;
  readonly collaborators$ = this._collaboratorsStore.collaborators$;
  readonly budget$ = this._budgetStore.budget$;

  constructor(
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _viewWorkspaceStore: ViewWorkspaceStore,
    private readonly _collaboratorsStore: CollaboratorsStore,
    private readonly _budgetStore: BudgetStore
  ) {
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
}
