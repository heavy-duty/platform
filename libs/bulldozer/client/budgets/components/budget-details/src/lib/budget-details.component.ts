import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Budget, Document } from '@heavy-duty/bulldozer-devkit';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

@Component({
  selector: 'bd-budget-details',
  template: `
    <div class="flex flex-wrap gap-6">
      <mat-card class="p-4 w-80 flex flex-col gap-8 bg-white bg-opacity-5">
        <div class="flex justify-start items-center gap-2">
          <figure
            class="w-20 h-20 flex justify-center items-center bg-black rounded-full"
          >
            <img src="assets/images/solana-logo.png" class="w-7/12" />
          </figure>

          <div class="flex flex-col items-start">
            <h2 class="m-0">Total budget</h2>
            <p class="m-0 font-bold text-2xl">
              {{
                (budget?.metadata?.lamports ?? 0) / lamportsPerSol
                  | number: '1.2-9'
              }}
            </p>
            <p class="m-0 text-sm opacity-75">Solana (SOL)</p>
          </div>
        </div>
        <div class="flex gap-4">
          <button
            class="flex-1"
            mat-stroked-button
            color="primary"
            bdDepositToBudget
            (depositToBudget)="onDepositToBudget($event)"
          >
            Deposit
          </button>
          <button class="flex-1" mat-stroked-button color="primary">
            Withdraw
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetDetailsComponent {
  readonly lamportsPerSol = LAMPORTS_PER_SOL;
  @Input() budget: Document<Budget> | null = null;
  @Input() minimumBalanceForRentExemption: number | null = null;
  @Output() depositToBudget = new EventEmitter();

  onDepositToBudget(amount: number) {
    console.log(amount);
    this.depositToBudget.emit(amount);
  }
}
