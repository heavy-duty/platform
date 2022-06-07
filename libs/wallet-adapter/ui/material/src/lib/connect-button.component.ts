import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	ElementRef,
	Input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Wallet } from '@heavy-duty/wallet-adapter';
import {
	HdWalletAdapterDirective,
	HdWalletConnectButtonDirective,
	HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { ButtonColor } from './types';

@Component({
	selector: 'hd-wallet-connect-button',
	template: `
		<button
			*hdWalletAdapter="
				let wallet = wallet;
				let connecting = connecting;
				let connected = connected
			"
			hdWalletConnectButton
			mat-raised-button
			[color]="color"
			[disabled]="connecting || !wallet || connected || disabled"
		>
			<ng-content></ng-content>
			<div class="button-content" *ngIf="!children">
				<hd-wallet-icon *ngIf="wallet" [wallet]="wallet"></hd-wallet-icon>
				{{ getMessage(connected, connecting, wallet) }}
			</div>
		</button>
	`,
	styles: [
		`
			button {
				display: inline-block;
			}

			.button-content {
				display: flex;
				gap: 0.5rem;
				align-items: center;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		HdWalletAdapterDirective,
		HdWalletIconComponent,
		HdWalletConnectButtonDirective,
		MatButtonModule,
	],
})
export class HdWalletConnectButtonComponent {
	@ContentChild('children') children: ElementRef | null = null;
	@Input() color: ButtonColor = 'primary';
	@Input() disabled = false;

	getMessage(connected: boolean, connecting: boolean, wallet: Wallet | null) {
		if (connecting) return 'Connecting...';
		if (connected) return 'Connected';
		if (wallet) return 'Connect';
		return 'Connect Wallet';
	}
}
