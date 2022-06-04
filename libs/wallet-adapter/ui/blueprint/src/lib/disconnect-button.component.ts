import { Component, ContentChild, ElementRef, Input } from '@angular/core';
import { Wallet } from '@heavy-duty/wallet-adapter';

@Component({
	selector: 'hd-wallet-disconnect-button',
	template: `
		<button
			*hdWalletAdapter="let wallet = wallet; let disconnecting = disconnecting"
			hdWalletDisconnectButton
			bpButton
			[disabled]="disconnecting || !wallet"
		>
			<ng-content></ng-content>
			<div class="button-content" *ngIf="!children">
				<hd-wallet-icon *ngIf="wallet" [wallet]="wallet"></hd-wallet-icon>
				{{ getMessage(disconnecting, wallet) }}
			</div>
		</button>
	`,
	styles: [
		`
			.button-content {
				display: flex;
				gap: 0.5rem;
				align-items: center;
			}
		`,
	],
})
export class HdWalletDisconnectButtonComponent {
	@ContentChild('children') children: ElementRef | null = null;
	@Input() disabled = false;

	getMessage(disconnecting: boolean, wallet: Wallet | null) {
		if (disconnecting) return 'Disconnecting...';
		if (wallet) return 'Disconnect';
		return 'Disconnect Wallet';
	}
}
