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
    <mat-card class="p-3">
      <section class="flex flex-col gap-3">
        <header bdSectionHeader>
          <h2>Budget</h2>
          <p>Visualize workspace's budget.</p>
        </header>

        <div class="flex flex-col gap-2">
          <p class="m-0">
            Minimum Balance for Rent Exemption:
            <span class="text-lg font-bold">
              {{ minimumBalanceForRentExemption | number }}
            </span>
            lamports.
            <span class="text-sm italic">
              ({{
                (minimumBalanceForRentExemption ?? 0) / lamportsPerSol
                  | number: '1.2-9'
              }}
              SOL)
            </span>
          </p>
          <p class="m-0">
            Total:

            <span class="text-lg font-bold">
              {{ budget?.metadata?.lamports | number }}
            </span>
            lamports.
            <span class="text-sm italic">
              ({{
                (budget?.metadata?.lamports ?? 0) / lamportsPerSol
                  | number: '1.2-9'
              }}
              SOL)
            </span>
          </p>
          <p class="m-0">
            Total after rent exemption:

            <span class="text-lg font-bold">
              {{
                (budget?.metadata?.lamports ?? 0) -
                  (minimumBalanceForRentExemption ?? 0) | number
              }}
            </span>
            lamports.
            <span class="text-sm italic">
              ({{
                ((budget?.metadata?.lamports ?? 0) -
                  (minimumBalanceForRentExemption ?? 0)) /
                  lamportsPerSol | number: '1.2-9'
              }}
              SOL)
            </span>
          </p>
        </div>

        <footer>
          <button
            mat-raised-button
            color="primary"
            bdDepositToBudgetTrigger
            (depositToBudget)="onDepositToBudget($event)"
          >
            Deposit
          </button>
        </footer>
      </section>
    </mat-card>
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
