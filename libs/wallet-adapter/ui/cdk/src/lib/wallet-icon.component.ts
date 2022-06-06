import { Component, Input } from '@angular/core';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { HdSanitizeUrlPipe } from './internals';

@Component({
	selector: 'hd-wallet-icon',
	template: ` <img [src]="wallet?.adapter?.icon | hdSanitizeUrl" alt="" /> `,
	styles: [
		`
			:host {
				width: 1.75rem;
				height: 1.75rem;
			}

			img {
				width: inherit;
				height: inherit;
			}
		`,
	],
	standalone: true,
	imports: [HdSanitizeUrlPipe],
})
export class HdWalletIconComponent {
	@Input() wallet!: Wallet;
}
