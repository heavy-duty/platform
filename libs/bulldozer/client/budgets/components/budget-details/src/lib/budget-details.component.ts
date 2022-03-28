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
    <div class="flex gap-6">
      <mat-card class="px-8 py-4 w-72">
        <h4 class="font-bold">Total budget</h4>
        <h1 class="m-0">
          <span class="font-bold">
            {{
              (budget?.metadata?.lamports ?? 0) / lamportsPerSol
                | number: '1.2-9'
            }}
          </span>
          SOL
        </h1>
        <p>
          <span class="text-sm italic">
            ({{ budget?.metadata?.lamports | number }}
            lamports.)
          </span>
        </p>
        <button
          class="mt-3 w-32"
          mat-raised-button
          color="primary"
          bdDepositToBudgetTrigger
          (depositToBudget)="onDepositToBudget($event)"
        >
          Deposit
        </button>
      </mat-card>

      <mat-card class="px-8 py-4 w-96">
        <h4 class="font-bold">Minimum Balance for Rent Exemption</h4>
        <h1 class="m-0">
          <span class="font-bold">
            {{
              (minimumBalanceForRentExemption ?? 0) / lamportsPerSol
                | number: '1.2-9'
            }}
          </span>
          SOL
        </h1>
        <p>
          <span class="text-sm italic">
            ({{ minimumBalanceForRentExemption | number }}
            lamports.)
          </span>
        </p>
      </mat-card>

      <mat-card class="px-8 py-4 w-96">
        <h4 class="font-bold">Total after rent exemption</h4>
        <h1 class="m-0">
          <span class="font-bold">
            {{
              ((budget?.metadata?.lamports ?? 0) -
                (minimumBalanceForRentExemption ?? 0)) /
                lamportsPerSol | number: '1.2-9'
            }}
          </span>
          SOL
        </h1>
        <p>
          <span class="text-sm italic">
            ({{
              (budget?.metadata?.lamports ?? 0) -
                (minimumBalanceForRentExemption ?? 0) | number
            }}
            lamports.)
          </span>
        </p>
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

  onDepositToBudget(lamports: number) {
    this.depositToBudget.emit(lamports);
  }
}
