import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BountyClaimModalComponent } from '../components/bounty-claim-modal.component';

@Directive({ selector: '[drillBountyClaimTrigger]' })
export class BountyClaimTriggerDirective {
	@Output() claimBounty = new EventEmitter<string>();
	@HostListener('click') onClick() {
		this._matDialog
			.open<BountyClaimModalComponent, unknown, string>(
				BountyClaimModalComponent,
				{
					panelClass: ['bp-bg-wood', 'bg-bd-brown', 'rounded'],
				}
			)
			.afterClosed()
			.subscribe((data) => data && this.claimBounty.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
