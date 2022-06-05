import { ClipboardModule } from '@angular/cdk/clipboard';
import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	ElementRef,
} from '@angular/core';
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
				<button bpButton [cdkMenuTriggerFor]="walletMenu">
					<ng-content></ng-content>
					<div class="button-content" *ngIf="!children">
						<hd-wallet-icon *ngIf="wallet" [wallet]="wallet"></hd-wallet-icon>
						{{ publicKey?.toBase58() | hdObscureAddress }}
					</div>
				</button>

				<ng-template #walletMenu>
					<div cdkMenu class="w-64 shadow-lg">
						<button
							*ngIf="publicKey"
							class="flex items-center gap-4 w-full px-4 py-2 bp-bg-wood bg-bd-brown"
							[cdkCopyToClipboard]="publicKey.toBase58()"
							cdkMenuItem
						>
							<span class="material-icons"> content_copy </span>

							Copy address
						</button>
						<button
							class="flex items-center gap-4 w-full px-4 py-2 bp-bg-wood bg-bd-brown"
							hdWalletModalButton
							cdkMenuItem
							panelClass="bp-bg-wood bg-bd-brown"
							[wallets]="wallets"
							[template]="template"
							(selectWallet)="selectWallet($event)"
						>
							<span class="material-icons"> sync_alt </span>

							Connect a different wallet
						</button>
						<div class="w-full border-t border-white border-opacity-20"></div>
						<button
							class="flex items-center gap-4 w-full px-4 py-2 bp-bg-wood bg-bd-brown"
							cdkMenuItem
							hdWalletDisconnectButton
						>
							<span class="material-icons"> logout </span>

							Disconnect
						</button>
					</div>
				</ng-template>
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
		CdkMenuModule,
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
