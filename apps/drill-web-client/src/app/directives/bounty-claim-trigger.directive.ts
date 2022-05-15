import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { concatMap, defer, EMPTY, from } from 'rxjs';
import { BountyClaimModalComponent } from '../components/bounty-claim-modal.component';
import { Option } from '../types';

@Directive({ selector: '[drillBountyClaimTrigger]' })
export class BountyClaimTriggerDirective {
	@Input() acceptedMint: Option<PublicKey> = null;
	@Output() claimBounty = new EventEmitter<PublicKey>();
	@HostListener('click') onClick() {
		if (this.acceptedMint === null) {
			throw new Error('Missing accepted mint.');
		}

		const acceptedMint = this.acceptedMint;

		this._matDialog
			.open<BountyClaimModalComponent, { acceptedMint: PublicKey }, string>(
				BountyClaimModalComponent,
				{
					panelClass: ['bp-bg-wood', 'bg-bd-brown', 'rounded'],
					data: { acceptedMint },
				}
			)
			.afterClosed()
			.pipe(
				concatMap((data) => {
					if (data === undefined || this.acceptedMint === null) {
						return EMPTY;
					}

					return defer(() =>
						from(getAssociatedTokenAddress(acceptedMint, new PublicKey(data)))
					);
				})
			)
			.subscribe((data) => {
				data && this.claimBounty.emit(data);
			});
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
