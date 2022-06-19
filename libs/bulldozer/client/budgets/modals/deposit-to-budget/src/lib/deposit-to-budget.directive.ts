import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BN } from '@heavy-duty/anchor';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { DepositToBudgetComponent } from './deposit-to-budget.component';

@Directive({ selector: '[bdDepositToBudget]' })
export class DepositToBudgetDirective {
	@Output() depositToBudget = new EventEmitter<{ amount: BN }>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<DepositToBudgetComponent, null, { amount: number }>(
				DepositToBudgetComponent,
				{ panelClass: ['bg-bp-wood', 'bg-bp-brown'] }
			)
			.afterClosed()
			.subscribe(
				(data) =>
					data &&
					this.depositToBudget.emit({
						amount: new BN(data.amount * LAMPORTS_PER_SOL),
					})
			);
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
