import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	ElementRef,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BlueprintButtonModule } from '@heavy-duty/blueprint-button';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { HdWalletConnectButtonComponent } from './connect-button.component';
import { HdWalletModalButtonComponent } from './modal-button.component';
import { HdWalletModalComponent } from './modal.component';

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
						panelClass="bd-bg-wood bg-bd-brown"
						[wallets]="wallets"
						[template]="template"
						(selectWallet)="selectWallet($event)"
					>
						<mat-icon>sync_alt</mat-icon>
						Connect a different wallet
					</button>
					<div class="w-full border-t border-white border-opacity-20"></div>
					<button mat-menu-item hdWalletDisconnectButton>
						<mat-icon>logout</mat-icon>
						Disconnect
					</button>
				</mat-menu>
			</ng-container>
		</ng-container>

		<ng-template #template>
			<hd-wallet-modal></hd-wallet-modal>
		</ng-template>
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
	standalone: true,
	imports: [
		CommonModule,
		ClipboardModule,
		MatIconModule,
		MatMenuModule,
		HdWalletAdapterCdkModule,
		HdWalletModalComponent,
		HdWalletModalButtonComponent,
		HdWalletConnectButtonComponent,
		BlueprintButtonModule,
	],
})
export class HdWalletMultiButtonComponent {
	@ContentChild('children') children: ElementRef | null = null;
}
