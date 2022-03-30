import { Injectable } from '@angular/core';
import {
  BudgetApiService,
  BudgetStore,
} from '@bulldozer-client/budgets-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { switchMap } from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
  budgetMinimumBalanceForRentExemption: number | null;
}

const initialState: ViewModel = {
  workspaceId: null,
  budgetMinimumBalanceForRentExemption: null,
};

@Injectable()
export class ViewWorkspaceBudgetStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly budgetMinimumBalanceForRentExemption$ = this.select(
    ({ budgetMinimumBalanceForRentExemption }) =>
      budgetMinimumBalanceForRentExemption
  );

  constructor(
    private readonly _budgetStore: BudgetStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _budgetApiService: BudgetApiService
  ) {
    super(initialState);

    this._budgetStore.setWorkspaceId(this.workspaceId$);
    this._loadBudgetMinimumBalanceForRentExemption();
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({
      ...state,
      workspaceId,
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
}
