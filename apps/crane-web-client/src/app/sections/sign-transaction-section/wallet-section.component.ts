import { ClipboardModule } from '@angular/cdk/clipboard';
import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BlueprintScrewCardComponent } from '@heavy-duty/blueprint-card';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { HdWalletModalButtonComponent } from '@heavy-duty/wallet-adapter-blueprint';
import {
	HdWalletDisconnectButtonDirective,
	HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { PublicKey } from '@solana/web3.js';
import { Option } from '../../utils';

@Component({
	selector: 'crane-wallet-section',
	template: `
		<bp-screw-card
			class="bg-black bg-bp-metal-2 px-6 py-4 rounded flex flex-col gap-4"
		>
			<header class="flex justify-between items-center">
				<h2 class="text-xl flex-1">Wallet</h2>

				<hd-wallet-modal-button
					*ngIf="publicKey === null"
					class="h-full text-xs flex gap-1"
				>
					<ng-container #children> Connect </ng-container>
				</hd-wallet-modal-button>

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
		</bp-screw-card>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		ClipboardModule,
		MatIconModule,
		DialogModule,
		HdWalletIconComponent,
		HdWalletDisconnectButtonDirective,
		HdWalletModalButtonComponent,
		BlueprintScrewCardComponent,
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
