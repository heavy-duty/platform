import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Budget,
  Document,
  findBudgetAddress,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { BudgetApiService } from './budget-api.service';
import { BudgetEventService } from './budget-event.service';

interface ViewModel {
  workspaceId: string | null;
  budgetId: string | null;
  budget: Document<Budget> | null;
}

const initialState: ViewModel = {
  workspaceId: null,
  budgetId: null,
  budget: null,
};

@Injectable()
export class BudgetStore extends ComponentStore<ViewModel> {
  readonly budget$ = this.select(({ budget }) => budget);
  readonly budgetId$ = this.select(({ budgetId }) => budgetId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _budgetApiService: BudgetApiService,
    private readonly _budgetEventService: BudgetEventService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadBudget(this.budgetId$);
    this._loadBudgetId(this.workspaceId$);
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({
      ...state,
      workspaceId,
    })
  );

  private readonly _loadBudget = this.effect<string | null>(
    switchMap((budgetId) => {
      if (budgetId === null) {
        return EMPTY;
      }

      return this._budgetApiService.findById(budgetId).pipe(
        tapResponse(
          (budget) => this.patchState({ budget }),
          (error) => this._notificationStore.setError({ error })
        )
      );
    })
  );

  private readonly _loadBudgetId = this.effect<string | null>(
    concatMap((workspaceId) => {
      if (workspaceId === null) {
        this.patchState({ budgetId: null });
        return EMPTY;
      }

      return findBudgetAddress(workspaceId).pipe(
        tapResponse(
          ([budgetId]) => this.patchState({ budgetId }),
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );
}
