import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { DepositToBudgetComponent } from './deposit-to-budget.component';

@Directive({ selector: '[bdDepositToBudget]' })
export class DepositToBudgetDirective {
  @Output() depositToBudget = new EventEmitter<number>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<DepositToBudgetComponent, null, { amount: number }>(
        DepositToBudgetComponent
      )
      .afterClosed()
      .subscribe(
        (data) =>
          data && this.depositToBudget.emit(data.amount * LAMPORTS_PER_SOL)
      );
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
