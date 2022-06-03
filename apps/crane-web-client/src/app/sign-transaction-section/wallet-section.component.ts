import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { Option } from '../utils';

@Component({
	selector: 'crane-wallet-section',
	template: `
		<crane-screwed-card class="bg-black bp-bg-metal-2 px-6 py-4 rounded block">
			<header class="flex justify-between items-center mb-2">
				<h2 class="text-xl">Wallet</h2>
				<button
					class="bg-black h-full p-1 bp-button uppercase text-xs"
					*ngrxLet="transaction$; let transaction"
					[disabled]="disabled"
					(click)="onSignTransaction()"
				>
					Sign <mat-icon inline>check_circle</mat-icon>
				</button>
			</header>

			<p
				class="flex items-center gap-2 px-2 bg-black bg-opacity-40 rounded-md"
				*ngIf="publicKey !== null"
			>
				<hd-wallet-icon
					*ngIf="wallet !== null"
					class="flex-shrink-0"
					[wallet]="wallet"
				></hd-wallet-icon>

				<span class="overflow-hidden whitespace-nowrap overflow-ellipsis">
					{{ publicKey.toBase58() }}
				</span>

				<button mat-icon-button [cdkCopyToClipboard]="publicKey.toBase58()">
					<mat-icon>content_copy</mat-icon>
				</button>
			</p>
		</crane-screwed-card>
	`,
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
