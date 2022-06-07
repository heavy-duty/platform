import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { HdWalletAdapterMaterialModule } from '@heavy-duty/wallet-adapter-material';
import { PublicKey } from '@solana/web3.js';
import { ScrewedCardComponent } from '../../components';
import { Option } from '../../utils';

@Component({
	selector: 'crane-wallet-section',
	template: `
		<crane-screwed-card
			class="bg-black bp-bg-metal-2 px-6 py-4 rounded flex flex-col gap-4"
		>
			<header class="flex justify-between items-center">
				<h2 class="text-xl flex-1">Wallet</h2>
				<button *ngIf="publicKey === null" hdWalletModalButton></button>

				<ng-container *ngIf="publicKey === null">
					<button
						*hdWalletAdapter="
							let wallets = wallets;
							let selectWallet = selectWallet
						"
						class="bg-black h-full p-1 bp-button uppercase text-xs"
						[wallets]="wallets"
						[className]="['bp-bg-wood', 'bg-bp-brown']"
						(selectWallet)="selectWallet($event)"
						hdWalletModalButton
					>
						Connect <mat-icon inline>login</mat-icon>
					</button>
				</ng-container>

				<button
					*ngIf="publicKey !== null"
					class="bg-black h-full p-1 bp-button uppercase text-xs"
					[disabled]="disabled"
					(click)="onSignTransaction()"
				>
					Sign <mat-icon inline>check_circle</mat-icon>
				</button>
				<button
					*ngIf="publicKey !== null"
					class="bg-black h-full p-1 bp-button uppercase text-xs text-red-500"
					hdWalletDisconnectButton
				>
					Exit <mat-icon inline>logout</mat-icon>
				</button>
			</header>

			<p
				*ngIf="publicKey !== null"
				class="flex items-center gap-2 p-2 bg-black bg-opacity-40 rounded-md"
			>
				<hd-wallet-icon
					*ngIf="wallet !== null"
					class="flex-shrink-0"
					[wallet]="wallet"
				></hd-wallet-icon>

				<span class="overflow-hidden whitespace-nowrap overflow-ellipsis">
					{{ publicKey.toBase58() }}
				</span>

				<button [cdkCopyToClipboard]="publicKey.toBase58()" mat-icon-button>
					<mat-icon>content_copy</mat-icon>
				</button>
			</p>
		</crane-screwed-card>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		ClipboardModule,
		MatIconModule,
		HdWalletAdapterCdkModule,
		HdWalletAdapterMaterialModule,
		ScrewedCardComponent,
	],
})
export class WalletSectionComponent {
	@Input() publicKey: Option<PublicKey> = null;
	@Input() wallet: Option<Wallet> = null;
	@Input() disabled = false;
	@Output() signTransaction = new EventEmitter();

	onSignTransaction() {
		this.signTransaction.emit();
	}
}
