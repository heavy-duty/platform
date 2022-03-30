import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BudgetStore } from '@bulldozer-client/budgets-data-access';
import { map } from 'rxjs';
import { ViewWorkspaceBudgetStore } from './view-workspace-budget.store';

@Component({
  selector: 'bd-workspace-details-explorer-budget',
  template: `
    <bd-budget-details
      *ngIf="budget$ | ngrxPush as budget"
      [budget]="budget"
      [minimumBalanceForRentExemption]="
        (budgetMinimumBalanceForRentExemption$ | ngrxPush) ?? null
      "
      (depositToBudget)="onDepositToBudget(budget.id, $event)"
    ></bd-budget-details>
  `,
  styles: [],
  providers: [BudgetStore, ViewWorkspaceBudgetStore],
})
export class ViewWorkspaceBudgetComponent implements OnInit {
  @HostBinding('class') class = 'block p-8';

  readonly budget$ = this._budgetStore.budget$;
  readonly budgetMinimumBalanceForRentExemption$ =
    this._viewWorkspaceBudgetStore.budgetMinimumBalanceForRentExemption$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _budgetStore: BudgetStore,
    private readonly _viewWorkspaceBudgetStore: ViewWorkspaceBudgetStore
  ) {}

  ngOnInit() {
    this._viewWorkspaceBudgetStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
  }

  onDepositToBudget(budgetId: string, lamports: number) {
    this._budgetStore.depositToBudget({
      budgetId,
      lamports,
    });
  }
}
