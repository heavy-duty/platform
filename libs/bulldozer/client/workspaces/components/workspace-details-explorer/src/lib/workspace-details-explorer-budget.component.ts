import { Component } from '@angular/core';
import { BudgetStore } from '@bulldozer-client/budgets-data-access';
import { WorkspaceDetailsExplorerStore } from './workspace-details-explorer.store';

@Component({
  selector: 'bd-workspace-details-explorer-budget',
  template: `
    <div class="py-4 px-8">
      <bd-budget-details
        *ngIf="budget$ | ngrxPush as budget"
        [budget]="budget"
        [minimumBalanceForRentExemption]="
          (budgetMinimumBalanceForRentExemption$ | ngrxPush) ?? null
        "
        (depositToBudget)="onDepositToBudget(budget.id, $event)"
      ></bd-budget-details>
    </div>
  `,
  styles: [],
})
export class WorkspaceDetailsExplorerBudgetComponent {
  readonly budget$ = this._budgetStore.budget$;
  readonly budgetMinimumBalanceForRentExemption$ =
    this._workspaceDetailsWorkspace.budgetMinimumBalanceForRentExemption$;

  constructor(
    private readonly _budgetStore: BudgetStore,
    private readonly _workspaceDetailsWorkspace: WorkspaceDetailsExplorerStore
  ) {}

  onDepositToBudget(budgetId: string, lamports: number) {
    this._budgetStore.depositToBudget({
      budgetId,
      lamports,
    });
  }
}
