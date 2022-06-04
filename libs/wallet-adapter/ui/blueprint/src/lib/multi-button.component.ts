import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	ElementRef,
} from '@angular/core';

@Component({
	selector: 'hd-wallet-multi-button',
	template: `
		<ng-container
			*hdWalletAdapter="
				let wallet = wallet;
				let wallets = wallets;
				let publicKey = publicKey;
				let connected = connected;
				let selectWallet = selectWallet
			"
		>
			<hd-wallet-modal-button *ngIf="wallet === null"></hd-wallet-modal-button>
			<hd-wallet-connect-button
				*ngIf="!connected && wallet"
			></hd-wallet-connect-button>

			<ng-container *ngIf="connected">
				<button bpButton [matMenuTriggerFor]="walletMenu">
					<ng-content></ng-content>
					<div class="button-content" *ngIf="!children">
						<hd-wallet-icon *ngIf="wallet" [wallet]="wallet"></hd-wallet-icon>
						{{ publicKey?.toBase58() | hdObscureAddress }}
					</div>
				</button>
				<mat-menu #walletMenu="matMenu">
					<button
						*ngIf="publicKey"
						mat-menu-item
						[cdkCopyToClipboard]="publicKey.toBase58()"
					>
						<mat-icon>content_copy</mat-icon>
						Copy address
					</button>
					<button
						mat-menu-item
						hdWalletModalButton
						[wallets]="wallets"
						(selectWallet)="selectWallet($event)"
					>
						<mat-icon>sync_alt</mat-icon>
						Connect a different wallet
					</button>
					<mat-divider></mat-divider>
					<button mat-menu-item hdWalletDisconnectButton>
						<mat-icon>logout</mat-icon>
						Disconnect
					</button>
				</mat-menu>
			</ng-container>
		</ng-container>
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
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HdWalletMultiButtonComponent {
	@ContentChild('children') children: ElementRef | null = null;
}
