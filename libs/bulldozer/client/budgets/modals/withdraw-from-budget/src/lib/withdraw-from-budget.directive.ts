import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BN } from '@heavy-duty/anchor';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WithdrawFromBudgetComponent } from './withdraw-from-budget.component';

@Directive({ selector: '[bdWithdrawFromBudget]' })
export class WithdrawFromBudgetDirective {
	@Output() withdrawFromBudget = new EventEmitter<{ amount: BN }>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<WithdrawFromBudgetComponent, null, { amount: number }>(
				WithdrawFromBudgetComponent,
				{ panelClass: ['bg-bp-wood', 'bg-bp-brown'] }
			)
			.afterClosed()
			.subscribe(
				(data) =>
					data &&
					this.withdrawFromBudget.emit({
						amount: new BN(data.amount * LAMPORTS_PER_SOL),
					})
			);
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
