import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DepositToBudgetComponent } from './deposit-to-budget.component';

@Directive({ selector: '[bdDepositToBudgetTrigger]' })
export class DepositToBudgetTriggerDirective {
  @Output() depositToBudget = new EventEmitter<number>();
  @HostListener('click') onClick(): void {
    this._matDialog
      .open<DepositToBudgetComponent, null, { lamports: number }>(
        DepositToBudgetComponent
      )
      .afterClosed()
      .subscribe((data) => data && this.depositToBudget.emit(data.lamports));
  }

  constructor(private readonly _matDialog: MatDialog) {}
}
