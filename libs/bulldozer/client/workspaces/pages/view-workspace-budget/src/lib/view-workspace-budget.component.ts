import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BudgetStore } from '@bulldozer-client/budgets-data-access';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { map } from 'rxjs';
import { ViewWorkspaceBudgetStore } from './view-workspace-budget.store';

@Component({
  selector: 'bd-workspace-details-explorer-budget',
  template: `
    <header class="mb-8">
      <h1 class="text-4xl uppercase mb-1 bd-font">budget</h1>
      <p class="text-sm font-thin mb-0">
        List of the budgets for this workspaces.
      </p>
    </header>

    <main class="flex flex-wrap gap-6" *ngIf="budget$ | ngrxPush as budget">
      <mat-card
        class="h-auto w-80 rounded-lg overflow-hidden bd-bg-image-1 p-0 mat-elevation-z8"
      >
        <header class="flex items-center bd-bg-black px-6 py-2 gap-1">
          <h2 class="uppercase m-0 text-lg">solana</h2>
        </header>

        <div class="px-8 mt-4">
          <section class="flex gap-2 mb-4">
            <figure
              class="w-12 h-12 flex justify-center items-center bg-black rounded-full mr-2"
            >
              <img src="assets/images/solana-logo.png" class="w-1/2" />
            </figure>

            <div>
              <p class="m-0 text-sm">Total budget</p>
              <p class="m-0 text-2xl mr-2">
                {{
                  (budget?.metadata?.lamports ?? 0) / lamportsPerSol
                    | number: '1.2-9'
                }}
                <span class="m-0 text-sm font-thin">SOL</span>
              </p>
            </div>
          </section>

          <footer
            class="py-2 px-5 w-60 h-12 bd-bg-image-11 shadow flex justify-center items-center m-auto mt-4 mb-4 relative bg-bd-black"
          >
            <button
              class="bd-button w-24"
              bdDepositToBudget
              (depositToBudget)="onDepositToBudget(budget.id, $event)"
            >
              Deposit
            </button>
            <button class="bd-button w-24">Withdraw</button>
            <div
              class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-5 left-2"
            >
              <div class="w-full h-px bg-gray-600 rotate-45"></div>
            </div>
            <div
              class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-5 right-2"
            >
              <div class="w-full h-px bg-gray-600"></div>
            </div>
          </footer>
        </div>
      </mat-card>
    </main>
  `,
  styles: [],
  providers: [BudgetStore, ViewWorkspaceBudgetStore],
})
export class ViewWorkspaceBudgetComponent implements OnInit {
  @HostBinding('class') class = 'block p-8 pt-5 h-full';

  readonly budget$ = this._budgetStore.budget$;
  readonly budgetMinimumBalanceForRentExemption$ =
    this._viewWorkspaceBudgetStore.budgetMinimumBalanceForRentExemption$;
  readonly lamportsPerSol = LAMPORTS_PER_SOL;

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
